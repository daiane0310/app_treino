import styles from './PageLoader.module.css'

function PageLoader() {
  return (
    <main className={styles.container} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span>Carregando...</span>
    </main>
  )
}

export default PageLoader
