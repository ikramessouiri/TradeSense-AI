import { useNavigate, useLocation } from 'react-router-dom'
import { ShieldCheck, Zap, CreditCard, Twitter, Linkedin, Instagram, Bot, Newspaper, GraduationCap } from 'lucide-react'
import AIChat from './AIChat'
import { useState, useContext } from 'react'
import { LangContext } from '../context/LangContext'
import { translations } from '../i18n/translations'

export default function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useContext(LangContext)
  const t = translations[lang] || translations.fr
  const [showPay, setShowPay] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [method, setMethod] = useState('CMI')
  const [loadingPay, setLoadingPay] = useState(false)
  const [paySuccess, setPaySuccess] = useState('')
  const [paypalEmail, setPaypalEmail] = useState('')
  const [planType, setPlanType] = useState('starter')

  const plans = [
    { code: 'starter', price: '200 DH' },
    { code: 'pro', price: '500 DH' },
    { code: 'enterprise', price: '1000 DH' },
  ]

  const startChallenge = (pt = 'starter') => {
    const uid = localStorage.getItem('user_id')
    if (!uid) {
      navigate('/register', { state: { msg: 'Veuillez vous connecter pour acheter un challenge' } })
      return
    }
    setPlanType(pt)
    setShowPay(true)
    setMethod('CMI')
    setLoadingPay(false)
    setPaySuccess('')
    fetch('/api/platform-settings')
      .then(r => r.json())
      .then(j => setPaypalEmail(j?.paypal_email || ''))
      .catch(() => setPaypalEmail(''))
  }

  const confirmPay = () => {
    setLoadingPay(true)
    setTimeout(async () => {
      setLoadingPay(false)
      setPaySuccess('Paiement réussi. Challenge activé.')
      try {
        const userIdStr = localStorage.getItem('user_id')
        if (!userIdStr) {
          setShowPay(false)
          navigate('/register')
          return
        }
        const userId = Number(userIdStr)
        const res = await fetch('/api/buy-challenge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, plan_type: planType }),
        })
        const j = await res.json()
        if (res.ok && j?.challenge_id) {
          localStorage.setItem('challengeId', String(j.challenge_id))
        }
      } catch {
        setPaySuccess((v) => v)
      }
      setTimeout(() => {
        setShowPay(false)
        navigate('/dashboard')
      }, 800)
    }, 3000)
  }

  return (
    <div
      className="relative min-h-screen bg-[url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1920')] bg-cover bg-center bg-fixed bg-no-repeat"
      style={{ direction: lang === 'ar' ? 'rtl' : 'ltr', textAlign: lang === 'ar' ? 'right' : 'left' }}
    >
      <div className="absolute inset-0 bg-black/75 z-0"></div>
      <div className="relative z-10">
        {/* Hero */}
        <section>
          <div className="mx-auto max-w-6xl px-6 py-24 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white">{t.home_title}</h1>
            <p className="mt-4 text-slate-300">{t.home_subtitle}</p>
            <div className="mt-8">
              <button
                onClick={() => startChallenge('starter')}
                className="inline-flex items-center rounded-md bg-sky-600 px-6 py-3 text-white hover:bg-sky-500 transition"
              >
                {t.home_start}
              </button>
            </div>
          </div>
        </section>

      {/* Réassurance Paiement */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-white text-center">{t.reassurance_title}</h2>
          <p className="mt-2 text-sm text-slate-400 text-center">
            {t.home_subtitle}
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-xl bg-slate-800 ring-1 ring-white/10 p-6 text-center shadow">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/15 ring-1 ring-sky-500/40">
                <ShieldCheck className="text-sky-400" size={28} />
              </div>
              <h3 className="text-white font-medium">{t.reassurance_secure_title}</h3>
              <p className="mt-2 text-sm text-slate-400">{t.reassurance_secure_desc}</p>
            </div>
            <div className="rounded-xl bg-slate-800 ring-1 ring-white/10 p-6 text-center shadow">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/40">
                <Zap className="text-emerald-400" size={28} />
              </div>
              <h3 className="text-white font-medium">{t.reassurance_fast_title}</h3>
              <p className="mt-2 text-sm text-slate-400">{t.reassurance_fast_desc}</p>
            </div>
            <div className="rounded-xl bg-slate-800 ring-1 ring-white/10 p-6 text-center shadow">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/15 ring-1 ring-sky-500/40">
                <CreditCard className="text-sky-400" size={28} />
              </div>
              <h3 className="text-white font-medium">{t.reassurance_easy_title}</h3>
              <p className="mt-2 text-sm text-slate-400">{t.reassurance_easy_desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Cards Grid: Assistance IA, News, MasterClass */}
      <section id="services">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div
              onClick={() => setChatOpen(true)}
              className="rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 p-6 text-center shadow transition-all hover:scale-105 hover:shadow-lg hover:bg-white/10 cursor-pointer"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/15 ring-1 ring-sky-500/40">
                <Bot className="text-sky-400" size={24} />
              </div>
              <h3 className="text-white font-medium">{t.services_assist_title}</h3>
              <p className="mt-2 text-sm text-slate-300">{t.services_assist_desc}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setChatOpen(true)
                }}
                className="mt-4 text-sm text-sky-400 hover:text-sky-300"
              >
                {t.services_assist_title} →
              </button>
            </div>
            <div
              onClick={() => {
                const el = document.getElementById('charts')
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 p-6 text-center shadow transition-all hover:scale-105 hover:shadow-lg hover:bg-white/10 cursor-pointer"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/40">
                <Newspaper className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-white font-medium">{t.services_news_title}</h3>
              <p className="mt-2 text-sm text-slate-300">{t.services_news_desc}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const el = document.getElementById('charts')
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="mt-4 text-sm text-sky-400 hover:text-sky-300"
              >
                En savoir plus →
              </button>
            </div>
            <div
              onClick={() => navigate('/masterclass')}
              className="rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 p-6 text-center shadow transition-all hover:scale-105 hover:shadow-lg hover:bg-white/10 cursor-pointer"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/15 ring-1 ring-violet-500/40">
                <GraduationCap className="text-violet-400" size={24} />
              </div>
              <h3 className="text-white font-medium">{t.masterclass_title}</h3>
              <p className="mt-2 text-sm text-slate-300">{t.masterclass_course_desc}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigate('/masterclass')
                }}
                className="mt-4 text-sm text-sky-400 hover:text-sky-300"
              >
                En savoir plus →
              </button>
            </div>
          </div>
        </div>
      </section>
      <section id="charts">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-white">Graphiques et analyses</h2>
          <p className="mt-2 text-sm text-slate-300">Visualisations des marchés et analyses en temps réel.</p>
        </div>
      </section>

      {/* Multi-Platform */}
      <section id="multi-platform" className="mt-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative rounded-2xl bg-white/5 backdrop-blur-sm text-white ring-1 ring-white/10 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 items-center">
              {/* Left visual (iMac) */}
              <div className="hidden md:block relative">
                <img
                  src="https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=1920"
                  alt="Desktop trading platform"
                  className="w-full h-full object-cover drop-shadow-3xl md:scale-125 -ml-24 md:-ml-28 xl:-ml-40 select-none pointer-events-none opacity-95"
                />
              </div>
              {/* Center content */}
              <div className="px-8 py-14 text-center">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Explore trading across all devices</h3>
                <p className="mt-3 text-sm sm:text-base text-slate-300">
                  Major global markets at your fingertips. Trade wherever you are, whenever you want to.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <button className="rounded-lg bg-black px-4 py-3 text-white border border-white/20 hover:bg-slate-800">
                    Download on the App Store
                  </button>
                  <button className="rounded-lg bg-black px-4 py-3 text-white border border-white/20 hover:bg-slate-800">
                    Get it on Google Play
                  </button>
                  <button className="rounded-lg bg-black px-4 py-3 text-white border border-white/20 hover:bg-slate-800">
                    Explore Web Platform
                  </button>
                </div>
              </div>
              {/* Right visuals (iPhones) */}
              <div className="hidden md:block relative">
                <div className="absolute right-0 top-6">
                  <img
                    src="https://images.unsplash.com/photo-1551817958-20204c6bb802?q=80&w=1080"
                    alt="Mobile trading app"
                    className="w-40 sm:w-48 md:w-56 rotate-3 drop-shadow-3xl -mr-20 md:-mr-24 xl:-mr-32 select-none pointer-events-none opacity-95"
                  />
                </div>
                <div className="absolute right-12 bottom-6">
                  <img
                    src="https://images.unsplash.com/photo-1551817958-20204c6bb802?q=80&w=1080"
                    alt="Mobile trading app"
                    className="w-36 sm:w-44 md:w-52 -rotate-6 drop-shadow-3xl -mr-16 md:-mr-20 xl:-mr-28 select-none pointer-events-none opacity-95"
                  />
                </div>
                <div className="invisible md:visible opacity-0">.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="text-2xl font-semibold text-white">{t.pricingTitle}</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.code} className="rounded-xl bg-slate-800 p-6 ring-1 ring-white/10 shadow">
                <h3 className="text-lg font-medium text-white">
                  {plan.code === 'starter' ? t.planStarter : plan.code === 'pro' ? t.planPro : t.planElite}
                </h3>
                <p className="mt-2 text-3xl font-bold text-white">{plan.price}</p>
                <p className="mt-2 text-sm text-slate-300">{t.pricing_desc}</p>
                <button
                  onClick={() => {
                    startChallenge(plan.code)
                  }}
                  className="mt-6 w-full inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-500 transition"
                >
                  {t.home_start}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-slate-900 p-6 ring-1 ring-white/10">
            <h3 className="text-lg font-semibold text-white">Paiement Simulé</h3>
            <p className="mt-2 text-sm text-slate-400">Choisissez une méthode de paiement</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => setMethod('CMI')}
                className={`rounded-md px-4 py-2 ${method === 'CMI' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'} ring-1 ring-white/10`}
              >
                CMI
              </button>
              <button
                onClick={() => setMethod('Crypto')}
                className={`rounded-md px-4 py-2 ${method === 'Crypto' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'} ring-1 ring-white/10`}
              >
                Crypto
              </button>
            </div>
            <div className="mt-6 flex justify-between gap-3">
              <div className="text-sm text-slate-400">
                {method === 'Crypto' ? 'Paiement en crypto' : method === 'CMI' ? 'Paiement par CMI' : `PayPal: ${paypalEmail || 'non configuré'}`}
              </div>
              <button
                onClick={() => setShowPay(false)}
                className="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                onClick={confirmPay}
                disabled={loadingPay}
                className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {loadingPay ? 'Chargement…' : `Payer (${method})`}
              </button>
            </div>
            {paySuccess && (
              <div className="mt-4 rounded-md bg-emerald-500/15 px-4 py-2 text-emerald-300 ring-1 ring-emerald-500/30">
                {paySuccess}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Smooth scroll trigger on mount if requested */}
      {location?.state?.scrollTo === 'services' && (() => {
        const el = document.getElementById('services')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })()}
      <AIChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      {/* Footer */}
      <footer className="mt-12 w-full bg-black/80 backdrop-blur-md border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-white font-semibold text-lg">{t.brand}</div>
              <p className="mt-2 text-sm text-slate-300">L'excellence de l'analyse financière par l'IA.</p>
            </div>
            <div>
              <div className="text-white font-semibold">Navigation</div>
              <div className="mt-3 space-y-2 text-sm">
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-slate-300 hover:text-white">Accueil</button>
                <div>
                  <button
                    onClick={() => {
                      const el = document.getElementById('services')
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    className="text-slate-300 hover:text-white"
                  >
                    Services
                  </button>
                </div>
                <div>
                  <button onClick={() => navigate('/masterclass')} className="text-slate-300 hover:text-white">MasterClass</button>
                </div>
              </div>
            </div>
            <div>
              <div className="text-white font-semibold">Légal</div>
              <div className="mt-3 space-y-2 text-sm">
                <a href="#" className="text-slate-300 hover:text-white">Conditions d'utilisation</a>
                <a href="#" className="text-slate-300 hover:text-white">Politique de confidentialité</a>
              </div>
            </div>
            <div>
              <div className="text-white font-semibold">Réseaux</div>
              <div className="mt-3 flex items-center gap-4">
                <a href="#" aria-label="Twitter" className="text-slate-300 hover:text-white">
                  <Twitter size={20} />
                </a>
                <a href="#" aria-label="LinkedIn" className="text-slate-300 hover:text-white">
                  <Linkedin size={20} />
                </a>
                <a href="#" aria-label="Instagram" className="text-slate-300 hover:text-white">
                  <Instagram size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
            © 2026 TradeSense AI. Tous droits réservés.
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}
