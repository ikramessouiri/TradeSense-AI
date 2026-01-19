import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const infoMsg = (location?.state && location.state.msg) ? String(location.state.msg) : ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (!name.trim() || !email.trim() || !password.trim()) {
        throw new Error('Veuillez remplir tous les champs')
      }
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ username: name, email, password }),
      })
      if (!res.ok) {
        let msg = ''
        try {
          const j = await res.json()
          msg = j?.error || ''
        } catch {
          const t = await res.text().catch(() => '')
          msg = t || ''
        }
        if (res.status === 409) {
          throw new Error(msg || 'Email déjà utilisé')
        }
        if (res.status === 400) {
          throw new Error(msg || 'Veuillez remplir tous les champs')
        }
        throw new Error(msg || `Inscription impossible (code ${res.status})`)
      }
      localStorage.setItem('username', name)
      navigate('/login')
    } catch (e) {
      setError(e.message || 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl bg-slate-800 p-6 ring-1 ring-white/10 shadow">
        <h1 className="text-2xl font-bold text-white text-center">Inscription</h1>
        <p className="mt-2 text-sm text-slate-400 text-center">Créez votre compte pour commencer le challenge</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-300">Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600"
              placeholder="Votre nom"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600"
              placeholder="votre@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="rounded-md bg-amber-500/15 px-4 py-2 text-amber-300 ring-1 ring-amber-500/30">{error}</div>}
          {!error && infoMsg && <div className="rounded-md bg-sky-500/15 px-4 py-2 text-sky-300 ring-1 ring-sky-500/30">{infoMsg}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? 'Création…' : 'Créer le compte'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-sky-400 hover:text-sky-300"
          >
            Déjà un compte ? Connectez-vous
          </button>
        </div>
      </div>
    </div>
  )
}
