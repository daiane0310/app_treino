import styles from './PlaceholderPage.module.css'

function AdminPlaceholderPage() {
  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <h1>Área Administrativa</h1>
        <p>Rota protegida para usuários ADMIN.</p>
      </section>
    </main>
  )
}

export default AdminPlaceholderPage
