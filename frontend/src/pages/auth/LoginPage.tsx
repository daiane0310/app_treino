import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getHomePath } from '../../routes/routeUtils'
import { getErrorMessage } from '../../utils/getErrorMessage'
import styles from './LoginPage.module.css'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const normalizedEmail = email.trim()

    if (!normalizedEmail || !senha) {
      setErrorMessage('Informe o e-mail e a senha.')
      return
    }

    setEmail(normalizedEmail)
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const authenticatedUser = await login(normalizedEmail, senha)
      navigate(getHomePath(authenticatedUser.tipo), { replace: true })
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
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

          {errorMessage && (
            <p id="login-error" className={styles.error} role="alert">
              {errorMessage}
            </p>
          )}

          <button
            className={styles.submitButton}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default LoginPage
