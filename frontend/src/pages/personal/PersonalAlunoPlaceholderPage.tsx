import { Link, useParams } from 'react-router-dom'
import styles from './PersonalAlunoPlaceholderPage.module.css'

function PersonalAlunoPlaceholderPage() {
  const { alunoId } = useParams<{ alunoId: string }>()

  return (
    <section className={styles.page}>
      <Link className={styles.backLink} to="/personal/alunos">
        ← Voltar para alunos
      </Link>
      <div className={styles.content}>
        <p>Aluno #{alunoId}</p>
        <h1>Detalhes do aluno</h1>
        <p>Esta tela será implementada na próxima fase.</p>
      </div>
    </section>
  )
}

export default PersonalAlunoPlaceholderPage
