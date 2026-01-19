import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ roles = ['admin', 'superadmin'], children }) {
  const role = (localStorage.getItem('role') || '').toLowerCase()
  const isAllowed = roles.includes(role)

  if (!isAllowed) {
    return <Navigate to="/" replace />
  }
  return children
}