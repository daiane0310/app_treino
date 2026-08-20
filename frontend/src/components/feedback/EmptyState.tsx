import styles from './FeedbackState.module.css'

interface EmptyStateProps {
  title: string
  description: string
}

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className={styles.state} aria-live="polite">
      <span className={styles.icon} aria-hidden="true">
        0
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  )
}

export default EmptyState
