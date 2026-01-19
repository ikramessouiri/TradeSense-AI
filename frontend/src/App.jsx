import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import LandingPage from './components/LandingPage'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import SuperAdmin from './pages/SuperAdmin'
import AdminPanel from './pages/AdminPanel'
import MasterClass from './pages/MasterClass'
import ProtectedRoute from './components/ProtectedRoute'
import RequireAuth from './components/RequireAuth'
import Navbar from './components/Navbar'
import { LangProvider } from './context/LangProvider'

function App() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth')
      if (raw) {
        const a = JSON.parse(raw)
        const uid = a?.user_id ? String(a.user_id) : ''
        const role = (a?.role || '').toLowerCase()
        if (uid) localStorage.setItem('user_id', uid)
        if (role) localStorage.setItem('role', role)
      }
    } catch (e) { void e }
  }, [])

  return (
    <LangProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/masterclass" element={<MasterClass />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/superadmin" element={<SuperAdmin />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin", "superadmin"]}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </LangProvider>
  )
}

export default App
