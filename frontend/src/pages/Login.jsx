import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('/api/login', { email, password })
      const userId = res?.data?.user_id
      const role = (res?.data?.role || '').toLowerCase()
      if (!userId) throw new Error('Identifiants incorrects')
      localStorage.setItem('user_id', String(userId))
      if (role) localStorage.setItem('role', role)
      const auth = { user_id: String(userId), role, logged_in: true }
      localStorage.setItem('auth', JSON.stringify(auth))
      navigate('/dashboard')
    } catch {
      setError('Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl bg-slate-800 p-6 ring-1 ring-white/10 shadow">
        <h1 className="text-2xl font-bold text-white text-center">Connexion</h1>
        <p className="mt-2 text-sm text-slate-400 text-center">Entrez vos identifiants pour continuer</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-500 disabled:opacity-50"
          >
            {loading ? 'Vérification…' : 'Se connecter'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-sm text-sky-400 hover:text-sky-300"
          >
            Pas encore de compte ? Inscrivez-vous
          </button>
        </div>
      </div>
    </div>
  )
}
