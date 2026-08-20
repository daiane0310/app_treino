import { Navigate, Outlet } from 'react-router-dom'
import PageLoader from '../components/feedback/PageLoader'
import { useAuth } from '../hooks/useAuth'

function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return <PageLoader />
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute
