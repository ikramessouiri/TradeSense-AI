import { useEffect, useRef, useState, useContext } from 'react'
import { LangContext } from '../context/LangContext'
import { translations } from '../i18n/translations'

export default function Dashboard() {
  const { lang } = useContext(LangContext)
  const t = translations[lang] || translations.fr
  const [btcPrice, setBtcPrice] = useState(null)
  const [iamPrice, setIamPrice] = useState(null)
  const [amount, setAmount] = useState(1)
  const [error, setError] = useState('')
  const [loadingTrade, setLoadingTrade] = useState(false)
  const [equity, setEquity] = useState(50000)
  const tvLoadedRef = useRef(false)

  const challengeId = (() => {
    const saved = localStorage.getItem('challengeId')
    return saved ? Number(saved) : 1
  })()

  useEffect(() => {
    const loadTv = () => {
      if (tvLoadedRef.current) return
      if (window.TradingView && window.TradingView.widget) {
        tvLoadedRef.current = true
        new window.TradingView.widget({
          autosize: true,
          symbol: 'BINANCE:BTCUSDT',
          interval: '60',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: lang === 'ar' ? 'ar' : (lang === 'en' ? 'en' : 'fr'),
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          container_id: 'tv-widget',
        })
        return
      }
      const s = document.createElement('script')
      s.src = 'https://s3.tradingview.com/tv.js'
      s.async = true
      s.onload = loadTv
      document.body.appendChild(s)
    }
    loadTv()
  }, [lang])

  useEffect(() => {
    let mounted = true
    const fetchPrices = async () => {
      try {
        const [btcRes, iamRes] = await Promise.all([
          fetch('/api/price/BTC-USD'),
          fetch('/api/price/IAM'),
        ])
        const btcJson = await btcRes.json()
        const iamJson = await iamRes.json()
        if (!mounted) return
        if (btcJson.price) setBtcPrice(Number(btcJson.price))
        if (iamJson.price) setIamPrice(Number(iamJson.price))
      } catch {
        setIamPrice((v) => v ?? null)
        setBtcPrice((v) => v ?? null)
      }
    }
    fetchPrices()
    const id = setInterval(fetchPrices, 5000)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [])

  const handleTrade = async (side) => {
    setLoadingTrade(true)
    setError('')
    try {
      const symbol = 'BTC-USD'
      const quantity = Number(amount) || 1
      const openPrice = Number(btcPrice ?? 50000)
      const slip = side === 'buy' ? openPrice * 0.001 : -openPrice * 0.001
      const closePrice = openPrice + slip
      const res = await fetch('http://localhost:5000/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_id: challengeId,
          symbol,
          type: side,
          quantity,
          open_price: openPrice,
          close_price: closePrice,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(String(json?.error || 'Erreur trade'))
      } else {
        const eq = json?.challenge?.current_equity
        if (typeof eq === 'number') setEquity(eq)
      }
    } catch {
      setError('Impossible de contacter le backend')
    } finally {
      setLoadingTrade(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-xl bg-slate-800 p-6 ring-1 ring-white/10">
            <div className="text-sm text-slate-400">{t.dash_balance}</div>
            <div className="mt-2 text-3xl font-bold text-white">{equity.toLocaleString('fr-MA')} DH</div>
          </div>
          <div className="rounded-xl bg-slate-800 p-6 ring-1 ring-white/10">
            <div className="text-sm text-slate-400">{t.dash_daily_loss}</div>
            <div className="mt-2 text-3xl font-bold text-white">5%</div>
          </div>
          <div className="rounded-xl bg-slate-800 p-6 ring-1 ring-white/10">
            <div className="text-sm text-slate-400">{t.dash_profit_target}</div>
            <div className="mt-2 text-3xl font-bold text-white">10%</div>
          </div>
        </div>

        <div className="mt-4 rounded-md bg-slate-800 px-4 py-2 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-300">{t.dash_iam}</div>
            <div className="text-white font-semibold">{iamPrice ? `${iamPrice.toFixed(2)} DH` : '—'}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl bg-slate-800 ring-1 ring-white/10 p-2">
            <div id="tv-widget" style={{ height: 420 }} />
          </div>
          <div className="space-y-6">
            <div className="rounded-xl bg-slate-800 ring-1 ring-white/10 p-6">
              <div className="text-lg font-semibold text-white">{t.dash_action_panel}</div>
              <div className="mt-4">
                <label className="block text-sm text-slate-300">{t.dash_amount}</label>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  placeholder="Quantité BTC"
                />
              </div>
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => handleTrade('buy')}
                  disabled={loadingTrade}
                  className="flex-1 rounded-md bg-emerald-600 px-4 py-3 text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {t.dash_buy}
                </button>
                <button
                  onClick={() => handleTrade('sell')}
                  disabled={loadingTrade}
                  className="flex-1 rounded-md bg-rose-600 px-4 py-3 text-white hover:bg-rose-500 disabled:opacity-50"
                >
                  {t.dash_sell}
                </button>
              </div>
              {error && <div className="mt-4 rounded-md bg-red-500/15 px-4 py-2 text-red-300 ring-1 ring-red-500/30">{error}</div>}
            </div>
            <div className="rounded-xl bg-slate-800 ring-1 ring-white/10 p-6">
              <div className="text-lg font-semibold text-white">{t.dash_ai_title}</div>
              <p className="mt-2 text-sm text-slate-300">
                {t.dash_ai_text}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
