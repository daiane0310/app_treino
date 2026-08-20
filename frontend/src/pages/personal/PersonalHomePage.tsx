import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import styles from './PersonalHomePage.module.css'

function PersonalHomePage() {
  const { usuario } = useAuth()
  const firstName = usuario?.nome.trim().split(/\s+/)[0] ?? 'Personal'

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Visão geral</p>
        <h1>Olá, {firstName}</h1>
        <p>Organize o acompanhamento dos seus alunos em um só lugar.</p>
      </header>

      <Link className={styles.shortcut} to="/personal/alunos">
        <span>
          <strong>Meus alunos</strong>
          <small>Visualize os alunos vinculados ao seu perfil.</small>
        </span>
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      </Link>
    </section>
  )
}

export default PersonalHomePage
