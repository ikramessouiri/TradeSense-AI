import { useEffect, useState } from 'react'

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPaypal, setShowPaypal] = useState(false)
  const [paypalClientId, setPaypalClientId] = useState('')
  const [paypalSecret, setPaypalSecret] = useState('')

  const role = (localStorage.getItem('role') || '').toLowerCase()
  const isSuperAdmin = role === 'superadmin'

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        const res = await fetch('/api/users')
        if (!res.ok) throw new Error('Erreur de chargement des utilisateurs')
        const json = await res.json()
        if (isMounted) setUsers(Array.isArray(json) ? json : (json?.users || []))
      } catch {
        // Fallback mock data si l’API n’est pas prête
        if (isMounted) {
          setError('Impossible de contacter l’API, affichage de données simulées.')
          setUsers([
            { id: 1, name: 'Alice', email: 'alice@example.com', status: 'active', role: 'user' },
            { id: 2, name: 'Bob', email: 'bob@example.com', status: 'failed', role: 'user' },
            { id: 3, name: 'Charly', email: 'charly@example.com', status: 'active', role: 'admin' },
          ])
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [])

  const handleSavePaypal = () => {
    // Simulation d’enregistrement
    alert(`Clés PayPal enregistrées (simulé)\nClient ID: ${paypalClientId}\nSecret: ${paypalSecret ? '••••••••' : ''}`)
    setShowPaypal(false)
    setPaypalClientId('')
    setPaypalSecret('')
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Panel</h1>
          {isSuperAdmin && (
            <button
              onClick={() => setShowPaypal(true)}
              className="inline-flex items-center rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-500"
            >
              Configuration PayPal
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-amber-500/15 px-4 py-2 text-amber-300 ring-1 ring-amber-500/30">{error}</div>
        )}

        <div className="mt-6 rounded-xl bg-slate-800 ring-1 ring-white/10 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Nom</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Rôle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 bg-slate-900">
              {loading ? (
                <tr><td className="px-4 py-4 text-slate-300" colSpan={5}>Chargement...</td></tr>
              ) : users.length === 0 ? (
                <tr><td className="px-4 py-4 text-slate-300" colSpan={5}>Aucun utilisateur</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 text-white">{u.id}</td>
                    <td className="px-4 py-3 text-white">{u.name || '-'}</td>
                    <td className="px-4 py-3 text-slate-300">{u.email || '-'}</td>
                    <td className="px-4 py-3 text-slate-300">{(u.role || '').toLowerCase()}</td>
                    <td className="px-4 py-3">
                      <span className={
                        `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          String(u.status).toLowerCase() === 'failed' ? 'bg-red-500/20 text-red-300 ring-1 ring-red-500/40' : 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                        }`
                      }>
                        {String(u.status).toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showPaypal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-lg bg-slate-900 p-6 shadow-lg ring-1 ring-white/10">
              <h2 className="text-lg font-semibold text-white">Configuration PayPal (Simulation)</h2>
              <p className="mt-1 text-sm text-slate-400">Saisissez vos clés API. Aucun envoi au backend pour l’instant.</p>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300">Client ID</label>
                  <input
                    type="text"
                    value={paypalClientId}
                    onChange={(e) => setPaypalClientId(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600"
                    placeholder="Votre Client ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Secret</label>
                  <input
                    type="password"
                    value={paypalSecret}
                    onChange={(e) => setPaypalSecret(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600"
                    placeholder="Votre Secret"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowPaypal(false)}
                  className="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSavePaypal}
                  className="rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-500"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
