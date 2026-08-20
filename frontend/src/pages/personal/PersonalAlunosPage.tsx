import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/feedback/EmptyState'
import ErrorState from '../../components/feedback/ErrorState'
import { getMeusAlunos } from '../../services/alunoService'
import type { AlunoResumoResponse } from '../../types/aluno'
import { getErrorMessage } from '../../utils/getErrorMessage'
import styles from './PersonalAlunosPage.module.css'

function PersonalAlunosPage() {
  const [alunos, setAlunos] = useState<AlunoResumoResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isActive = true

    async function loadAlunos() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const response = await getMeusAlunos()
        if (isActive) {
          setAlunos(response)
        }
      } catch (error: unknown) {
        if (isActive) {
          setErrorMessage(getErrorMessage(error))
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadAlunos()

    return () => {
      isActive = false
    }
  }, [reloadKey])

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Acompanhamento</p>
        <h1>Meus alunos</h1>
        <p>Consulte os alunos atualmente vinculados ao seu perfil.</p>
      </header>

      {isLoading && (
        <div className={styles.loading} role="status" aria-live="polite">
          Carregando alunos...
        </div>
      )}

      {!isLoading && errorMessage && (
        <ErrorState
          message={errorMessage}
          onRetry={() => setReloadKey((current) => current + 1)}
        />
      )}

      {!isLoading && !errorMessage && alunos.length === 0 && (
        <EmptyState
          title="Nenhum aluno vinculado"
          description="Quando houver alunos vinculados ao seu perfil, eles aparecerão aqui."
        />
      )}

      {!isLoading && !errorMessage && alunos.length > 0 && (
        <ul className={styles.grid} aria-label="Alunos vinculados">
          {alunos.map((aluno) => (
            <li key={aluno.id} className={styles.card}>
              <span className={styles.avatar} aria-hidden="true">
                {aluno.nome.trim().charAt(0).toUpperCase()}
              </span>
              <div className={styles.details}>
                <h2>{aluno.nome}</h2>
                <p>{aluno.email}</p>
              </div>
              <Link className={styles.action} to={`/personal/alunos/${aluno.id}`}>
                Ver aluno
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default PersonalAlunosPage
