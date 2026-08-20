import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './PersonalLayout.module.css'

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function PersonalLayout() {
  const navigate = useNavigate()
  const { usuario, logout } = useAuth()

  if (!usuario) {
    return null
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <NavLink className={styles.brand} to="/personal" aria-label="App Treino — início">
          <span className={styles.brandMark} aria-hidden="true">
            AT
          </span>
          <span>App Treino</span>
        </NavLink>

        <nav className={styles.desktopNav} aria-label="Navegação do personal">
          <NavLink className={navLinkClass} end to="/personal">
            Início
          </NavLink>
          <NavLink className={navLinkClass} to="/personal/alunos">
            Alunos
          </NavLink>
        </nav>

        <div className={styles.userArea}>
          <span className={styles.avatar} aria-hidden="true">
            {getInitials(usuario.nome)}
          </span>
          <div className={styles.userDetails}>
            <strong>{usuario.nome}</strong>
            <span>PERSONAL</span>
          </div>
          <button className={styles.logoutButton} type="button" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </aside>

      <header className={styles.mobileHeader}>
        <NavLink className={styles.mobileBrand} to="/personal">
          <span className={styles.brandMark} aria-hidden="true">
            AT
          </span>
          <span>App Treino</span>
        </NavLink>
        <button
          className={styles.mobileLogout}
          type="button"
          onClick={handleLogout}
          aria-label="Sair da conta"
        >
          Sair
        </button>
        <div className={styles.mobileIdentity}>
          <span className={styles.avatar} aria-hidden="true">
            {getInitials(usuario.nome)}
          </span>
          <span>
            <strong>{usuario.nome}</strong>
            <small>PERSONAL</small>
          </span>
        </div>
      </header>

      <main className={styles.mainContent}>
        <Outlet />
      </main>

      <nav className={styles.mobileNav} aria-label="Navegação do personal">
        <NavLink className={navLinkClass} end to="/personal">
          Início
        </NavLink>
        <NavLink className={navLinkClass} to="/personal/alunos">
          Alunos
        </NavLink>
      </nav>
    </div>
  )
}

export default PersonalLayout
