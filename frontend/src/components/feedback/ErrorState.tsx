import styles from './FeedbackState.module.css'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section className={styles.state} role="alert">
      <span className={`${styles.icon} ${styles.errorIcon}`} aria-hidden="true">
        !
      </span>
      <h2>Não foi possível carregar</h2>
      <p>{message}</p>
      {onRetry && (
        <button className={styles.retryButton} type="button" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </section>
  )
}

export default ErrorState
