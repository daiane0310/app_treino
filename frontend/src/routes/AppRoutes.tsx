import { Navigate, Route, Routes } from 'react-router-dom'
import PageLoader from '../components/feedback/PageLoader'
import { useAuth } from '../hooks/useAuth'
import AdminPlaceholderPage from '../pages/AdminPlaceholderPage'
import AlunoPlaceholderPage from '../pages/aluno/AlunoPlaceholderPage'
import LoginPlaceholderPage from '../pages/auth/LoginPlaceholderPage'
import ForbiddenPage from '../pages/errors/ForbiddenPage'
import NotFoundPage from '../pages/errors/NotFoundPage'
import PersonalPlaceholderPage from '../pages/personal/PersonalPlaceholderPage'
import ProtectedRoute from './ProtectedRoute'
import PublicOnlyRoute from './PublicOnlyRoute'
import RoleRoute from './RoleRoute'
import { getHomePath } from './routeUtils'

function RootRedirect() {
  const { isAuthenticated, isInitializing, usuario } = useAuth()

  if (isInitializing) {
    return <PageLoader />
  }

  if (isAuthenticated && usuario) {
    return <Navigate to={getHomePath(usuario.tipo)} replace />
  }

  return <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPlaceholderPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute roles={['PERSONAL']} />}>
          <Route path="/personal" element={<PersonalPlaceholderPage />} />
        </Route>
        <Route element={<RoleRoute roles={['ALUNO']} />}>
          <Route path="/aluno" element={<AlunoPlaceholderPage />} />
        </Route>
        <Route element={<RoleRoute roles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminPlaceholderPage />} />
        </Route>
      </Route>

      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
