import styles from '../PlaceholderPage.module.css'

function AlunoPlaceholderPage() {
  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <h1>Área do Aluno</h1>
        <p>Rota protegida para usuários ALUNO.</p>
      </section>
    </main>
  )
}

export default AlunoPlaceholderPage
