import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from '../pages/aluno/Aluno.module.css'

export default function AlunoLayout() {
  const { usuario, logout } = useAuth()
  return <div className={styles.shell}>
    <header className={styles.navigation}>
      <Link className={styles.brand} to="/aluno">App Treino</Link>
      <nav aria-label="Navegação do aluno"><Link to="/aluno">Meus treinos</Link></nav>
      <span className={styles.identity}>{usuario?.nome} · ALUNO</span>
      <button className={styles.secondary} onClick={logout} type="button">Sair</button>
    </header>
    <div className={styles.content}><Outlet /></div>
  </div>
}
