import { isAxiosError } from 'axios'
import { useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useBackendAvailability } from '../../hooks/useBackendAvailability'
import { getHomePath } from '../../routes/routeUtils'
import { getErrorMessage } from '../../utils/getErrorMessage'
import styles from './LoginPage.module.css'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { availability, retry, markConnectionLost, canSubmit } = useBackendAvailability()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submission = useRef<AbortController | null>(null)
  const ready = availability === 'ready'
  const connectionLost = availability === 'connection-lost'

  useLayoutEffect(() => () => {
    submission.current?.abort()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit() || submission.current) {
      return
    }

    const normalizedEmail = email.trim()

    if (!normalizedEmail || !senha) {
      setErrorMessage('Informe o e-mail e a senha.')
      return
    }

    setEmail(normalizedEmail)
    setErrorMessage(null)
    const controller = new AbortController()
    submission.current = controller
    setIsSubmitting(true)

    try {
      const authenticatedUser = await login(normalizedEmail, senha, controller.signal)
      if (controller.signal.aborted) return
      navigate(getHomePath(authenticatedUser.tipo), { replace: true })
    } catch (error: unknown) {
      if (controller.signal.aborted) return
      if (isAxiosError(error)) {
        const status = error.response?.status
        if (status === 401) {
          setErrorMessage('E-mail ou senha inválidos.')
          return
        }
        if (status === undefined || status === 502 || status === 503 || status === 504) {
          markConnectionLost()
          return
        }
      }
      setErrorMessage(getErrorMessage(error))
    } finally {
      submission.current = null
      if (!controller.signal.aborted) setIsSubmitting(false)
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="login-title">
        <header className={styles.header}>
          <span className={styles.brandMark} aria-hidden="true">
            AT
          </span>
          <p className={styles.brand}>App Treino</p>
          <h1 id="login-title">Entrar</h1>
          <p className={styles.supportText}>
            Acesse seus treinos e acompanhe sua evolução.
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={errorMessage ? 'login-error' : undefined}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="senha">Senha</label>
            <div className={styles.passwordField}>
              <input
                id="senha"
                name="senha"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                disabled={isSubmitting}
                aria-invalid={Boolean(errorMessage)}
                aria-describedby={errorMessage ? 'login-error' : undefined}
                required
              />
              <button
                className={styles.passwordToggle}
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                disabled={isSubmitting}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          {availability === 'starting' && (
            <p className={styles.availabilityMessage} role="status">
              Estamos iniciando o servidor. Você já pode preencher seu e-mail e senha.
            </p>
          )}

          {(availability === 'unavailable' || connectionLost) && (
            <div className={styles.availabilityMessage}>
              <p role="status">
                {connectionLost
                  ? 'A conexão com o servidor foi interrompida durante o login. Tente novamente para verificar a conexão.'
                  : 'O servidor não respondeu a tempo ou está indisponível.'}
              </p>
              <button className={styles.retryButton} type="button" onClick={retry}>
                Tentar novamente
              </button>
            </div>
          )}

          {errorMessage && (
            <p id="login-error" className={styles.error} role="alert">
              {errorMessage}
            </p>
          )}

          <button
            className={styles.submitButton}
            type="submit"
            disabled={!ready || isSubmitting}
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default LoginPage
