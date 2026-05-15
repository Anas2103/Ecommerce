import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LoadingSpinner from './ui/LoadingSpinner'

export default function ProtectedRoute({ children, roles }) {
  const { user, token, isInitialized } = useSelector((s) => s.auth)
  const location = useLocation()

  if (!isInitialized) return <LoadingSpinner center size="lg" />

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

