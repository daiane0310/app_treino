import { Navigate, Route, Routes } from 'react-router-dom'
import PageLoader from '../components/feedback/PageLoader'
import { useAuth } from '../hooks/useAuth'
import PersonalLayout from '../layouts/PersonalLayout'
import AdminPlaceholderPage from '../pages/AdminPlaceholderPage'
import AlunoLayout from '../layouts/AlunoLayout'
import AlunoTreinosPage from '../pages/aluno/AlunoTreinosPage'
import AlunoTreinoPage from '../pages/aluno/AlunoTreinoPage'
import AlunoExecucaoPage from '../pages/aluno/AlunoExecucaoPage'
import LoginPage from '../pages/auth/LoginPage'
import ForbiddenPage from '../pages/errors/ForbiddenPage'
import NotFoundPage from '../pages/errors/NotFoundPage'
import PersonalAlunoPage from '../pages/personal/PersonalAlunoPage'
import PersonalAlunosPage from '../pages/personal/PersonalAlunosPage'
import PersonalHomePage from '../pages/personal/PersonalHomePage'
import PersonalTreinoPage from '../pages/personal/PersonalTreinoPage'
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
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute roles={['PERSONAL']} />}>
          <Route path="/personal" element={<PersonalLayout />}>
            <Route index element={<PersonalHomePage />} />
            <Route path="alunos" element={<PersonalAlunosPage />} />
            <Route
              path="alunos/:alunoId"
              element={<PersonalAlunoPage />}
            />
            <Route
              path="alunos/:alunoId/treinos/:treinoId"
              element={<PersonalTreinoPage />}
            />
          </Route>
        </Route>
        <Route element={<RoleRoute roles={['ALUNO']} />}>
          <Route path="/aluno" element={<AlunoLayout />}>
            <Route index element={<AlunoTreinosPage />} />
            <Route path="treinos/:treinoId" element={<AlunoTreinoPage />} />
            <Route path="execucoes/:execucaoId" element={<AlunoExecucaoPage />} />
          </Route>
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
