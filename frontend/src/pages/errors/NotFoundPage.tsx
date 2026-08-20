import styles from '../PlaceholderPage.module.css'

function NotFoundPage() {
  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <h1>Página não encontrada</h1>
        <p>Verifique o endereço informado e tente novamente.</p>
      </section>
    </main>
  )
}

export default NotFoundPage
