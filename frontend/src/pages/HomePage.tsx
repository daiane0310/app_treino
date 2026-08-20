import styles from './HomePage.module.css'

function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="page-title">
        <span className={styles.badge}>Base inicial</span>
        <h1 id="page-title">App Treino</h1>
        <p>Frontend iniciado com sucesso</p>
      </section>
    </main>
  )
}

export default HomePage
