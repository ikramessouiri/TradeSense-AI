import { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LangContext } from '../context/LangContext'
import { translations } from '../i18n/translations'

export default function Navbar() {
  const { lang, setLang } = useContext(LangContext)
  const navigate = useNavigate()
  const location = useLocation()
  const t = translations[lang] || translations.fr
  const [username, setUsername] = useState(localStorage.getItem('username') || '')
  const userId = localStorage.getItem('user_id') || ''
  const isLoggedIn = !!userId

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!isLoggedIn || username) return
      try {
        const res = await fetch('/api/users')
        const j = await res.json()
        const u = Array.isArray(j) ? j.find((r) => String(r.id) === String(userId)) : null
        const name = u?.name || ''
        if (active && name) {
          localStorage.setItem('username', name)
          setUsername(name)
        }
      } catch (e) { void e }
    }
    load()
    return () => { active = false }
  }, [isLoggedIn, userId, username])

  const logout = () => {
    localStorage.removeItem('auth')
    localStorage.removeItem('user_id')
    localStorage.removeItem('role')
    localStorage.removeItem('username')
    navigate('/')
  }
  const goServices = () => {
    if (location.pathname === '/') {
      const el = document.getElementById('services')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      navigate('/', { state: { scrollTo: 'services' } })
    }
  }
  return (
    <div className="sticky top-0 z-50 w-full bg-black/60 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
        <Link to="/" className="text-sky-400 font-bold text-lg hover:text-sky-300">
          {t.brand}
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={goServices}
            className="text-slate-200 hover:text-sky-300"
          >
            {t.nav_services}
          </button>
          <Link
            to="/masterclass"
            className="text-slate-200 hover:text-sky-300"
          >
            {t.nav_masterclass}
          </Link>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="rounded-md bg-slate-800 text-white px-3 py-2 ring-1 ring-white/10"
          >
            <option value="fr">FR</option>
            <option value="en">EN</option>
            <option value="ar">AR</option>
          </select>
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="text-slate-200">{username || `Utilisateur #${userId}`}</span>
              <button
                onClick={logout}
                className="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
              >
                {t.nav_logout}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-500"
              >
                {t.nav_login}
              </button>
              <button
                onClick={() => navigate('/register')}
                className="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
              >
                {t.nav_register}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
