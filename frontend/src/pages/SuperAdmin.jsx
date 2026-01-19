import { useEffect, useState } from 'react'

export default function SuperAdmin() {
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/platform-settings')
        const j = await res.json()
        setEmail(j?.paypal_email || '')
      } catch {
        setEmail((v) => v || '')
      }
    }
    load()
  }, [])

  const save = async () => {
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch('/api/platform-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paypal_email: email }),
      })
      if (!res.ok) throw new Error('Échec enregistrement')
      setMsg('Adresse PayPal enregistrée')
    } catch {
      setMsg('Erreur lors de l’enregistrement')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold text-white">Configuration SuperAdmin</h1>
        <div className="mt-6 rounded-xl bg-slate-800 p-6 ring-1 ring-white/10">
          <label className="block text-sm font-medium text-slate-300">Email PayPal de la plateforme</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-md border border-slate-700 bg-slate-900 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600"
            placeholder="paypal@exemple.com"
          />
          <div className="mt-4">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-500 disabled:opacity-50"
            >
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
          {msg && <div className="mt-4 rounded-md bg-emerald-500/15 px-4 py-2 text-emerald-300 ring-1 ring-emerald-500/30">{msg}</div>}
        </div>
      </div>
    </div>
  )
}
