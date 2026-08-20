import { Navigate, Outlet } from 'react-router-dom'
import PageLoader from '../components/feedback/PageLoader'
import { useAuth } from '../hooks/useAuth'
import { getHomePath } from './routeUtils'

function PublicOnlyRoute() {
  const { isAuthenticated, isInitializing, usuario } = useAuth()

  if (isInitializing) {
    return <PageLoader />
  }

  if (isAuthenticated && usuario) {
    return <Navigate to={getHomePath(usuario.tipo)} replace />
  }

  return <Outlet />
}

export default PublicOnlyRoute
