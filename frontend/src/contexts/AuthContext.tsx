import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { login as requestLogin } from '../services/authService'
import { getMe } from '../services/usuarioService'
import type { UsuarioMeResponse } from '../types/auth'
import {
  getStoredToken,
  removeStoredToken,
  SESSION_EXPIRED_EVENT,
  storeToken,
} from '../utils/session'

interface AuthContextValue {
  token: string | null
  usuario: UsuarioMeResponse | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (email: string, senha: string) => Promise<UsuarioMeResponse>
  logout: () => void
  restaurarSessao: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null)
  const [usuario, setUsuario] = useState<UsuarioMeResponse | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const sessionRestorationStarted = useRef(false)

  const logout = useCallback(() => {
    removeStoredToken()
    setToken(null)
    setUsuario(null)
  }, [])

  const login = useCallback(async (email: string, senha: string) => {
    const response = await requestLogin({ email, senha })
    const authenticatedUser: UsuarioMeResponse = {
      id: response.id,
      nome: response.nome,
      email: response.email,
      tipo: response.tipo,
    }

    storeToken(response.token)
    setToken(response.token)
    setUsuario(authenticatedUser)
    return authenticatedUser
  }, [])

  const restaurarSessao = useCallback(async () => {
    const storedToken = getStoredToken()

    if (!storedToken) {
      setIsInitializing(false)
      return
    }

    setToken(storedToken)

    try {
      const authenticatedUser = await getMe()
      setUsuario(authenticatedUser)
    } catch {
      logout()
    } finally {
      setIsInitializing(false)
    }
  }, [logout])

  useEffect(() => {
    if (sessionRestorationStarted.current) {
      return
    }

    sessionRestorationStarted.current = true
    void restaurarSessao()
  }, [restaurarSessao])

  useEffect(() => {
    const handleSessionExpired = () => logout()
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
    }
  }, [logout])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      usuario,
      isAuthenticated: Boolean(token && usuario),
      isInitializing,
      login,
      logout,
      restaurarSessao,
    }),
    [token, usuario, isInitializing, login, logout, restaurarSessao],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
