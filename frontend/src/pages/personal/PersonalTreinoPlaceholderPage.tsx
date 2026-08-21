import { Link, useParams } from 'react-router-dom'
import styles from './PersonalTreinoPlaceholderPage.module.css'

function PersonalTreinoPlaceholderPage() {
  const { alunoId, treinoId } = useParams<{
    alunoId: string
    treinoId: string
  }>()

  return (
    <section className={styles.page}>
      <Link className={styles.backLink} to={`/personal/alunos/${alunoId}`}>
        ← Voltar para o aluno
      </Link>
      <div className={styles.content}>
        <p>Treino #{treinoId}</p>
        <h1>Detalhes do treino</h1>
        <p>A prescrição deste treino será implementada na próxima fase.</p>
      </div>
    </section>
  )
}

export default PersonalTreinoPlaceholderPage
