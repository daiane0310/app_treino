import styles from '../PlaceholderPage.module.css'

function ForbiddenPage() {
  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <h1>Acesso negado</h1>
        <p>Você não possui permissão para acessar esta área.</p>
      </section>
    </main>
  )
}

export default ForbiddenPage
