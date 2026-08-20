import styles from '../PlaceholderPage.module.css'

function PersonalPlaceholderPage() {
  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <h1>Área do Personal</h1>
        <p>Rota protegida para usuários PERSONAL.</p>
      </section>
    </main>
  )
}

export default PersonalPlaceholderPage
