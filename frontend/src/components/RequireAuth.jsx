import { Navigate } from 'react-router-dom'

export default function RequireAuth({ children }) {
  const userId = localStorage.getItem('user_id')
  if (!userId) return <Navigate to="/login" replace />
  return children
}
