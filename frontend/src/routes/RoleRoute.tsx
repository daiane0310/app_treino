import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { TipoUsuario } from '../types/auth'

interface RoleRouteProps {
  roles: TipoUsuario[]
}

function RoleRoute({ roles }: RoleRouteProps) {
  const { usuario } = useAuth()

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return roles.includes(usuario.tipo) ? (
    <Outlet />
  ) : (
    <Navigate to="/403" replace />
  )
}

export default RoleRoute
