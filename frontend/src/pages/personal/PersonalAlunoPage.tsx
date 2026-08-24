import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import EmptyState from '../../components/feedback/EmptyState'
import ErrorState from '../../components/feedback/ErrorState'
import { getMeusAlunos } from '../../services/alunoService'
import { getTreinosDoAluno } from '../../services/treinoService'
import type { AlunoResumoResponse } from '../../types/aluno'
import type { TreinoResponse } from '../../types/treino'
import { getErrorMessage } from '../../utils/getErrorMessage'
import styles from './PersonalAlunoPage.module.css'

function parseAlunoId(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) {
    return null
  }

  const id = Number(value)
  return Number.isSafeInteger(id) ? id : null
}

function PersonalAlunoPage() {
  const { alunoId: alunoIdParam } = useParams<{ alunoId: string }>()
  const [aluno, setAluno] = useState<AlunoResumoResponse | null>(null)
  const [treinos, setTreinos] = useState<TreinoResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [canRetry, setCanRetry] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isActive = true
    const alunoId = parseAlunoId(alunoIdParam)

    if (alunoId === null) {
      setAluno(null)
      setTreinos([])
      setErrorMessage('O identificador do aluno é inválido.')
      setCanRetry(false)
      setIsLoading(false)
      return () => {
        isActive = false
      }
    }

    const alunoIdValidado = alunoId

    async function loadAlunoETreinos() {
      setIsLoading(true)
      setErrorMessage(null)
      setCanRetry(false)

      try {
        const alunos = await getMeusAlunos()
        const alunoSelecionado = alunos.find(
          (item) => item.id === alunoIdValidado,
        )

        if (!alunoSelecionado) {
          if (isActive) {
            setAluno(null)
            setTreinos([])
            setErrorMessage('Aluno indisponível ou não vinculado ao seu perfil.')
          }
          return
        }

        const treinosDoAluno = await getTreinosDoAluno(alunoIdValidado)

        if (isActive) {
          setAluno(alunoSelecionado)
          setTreinos(treinosDoAluno)
        }
      } catch (error: unknown) {
        if (isActive) {
          setAluno(null)
          setTreinos([])
          setErrorMessage(getErrorMessage(error))
          setCanRetry(true)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadAlunoETreinos()

    return () => {
      isActive = false
    }
  }, [alunoIdParam, reloadKey])

  return (
    <section className={styles.page}>
      <Link className={styles.backLink} to="/personal/alunos">
        ← Voltar para alunos
      </Link>

      {isLoading && (
        <div className={styles.loading} role="status" aria-live="polite">
          Carregando acompanhamento do aluno...
        </div>
      )}

      {!isLoading && errorMessage && (
        <ErrorState
          message={errorMessage}
          onRetry={
            canRetry
              ? () => setReloadKey((current) => current + 1)
              : undefined
          }
        />
      )}

      {!isLoading && !errorMessage && aluno && (
        <>
          <header className={styles.studentHeader}>
            <p className={styles.eyebrow}>Acompanhamento do aluno</p>
            <h1>{aluno.nome}</h1>
            <p>{aluno.email}</p>
          </header>

          <section className={styles.workouts} aria-labelledby="workouts-title">
            <div className={styles.sectionHeader}>
              <h2 id="workouts-title">Treinos</h2>
              <p>Treinos atualmente atribuídos a este aluno.</p>
            </div>

            {treinos.length === 0 ? (
              <EmptyState
                title="Nenhum treino cadastrado"
                description="Este aluno ainda não possui treinos cadastrados."
              />
            ) : (
              <ul className={styles.workoutGrid} aria-label="Treinos do aluno">
                {treinos.map((treino) => (
                  <li className={styles.workoutCard} key={treino.id}>
                    <div className={styles.workoutHeading}>
                      <h3>{treino.nome}</h3>
                      <span
                        className={
                          treino.ativo ? styles.activeStatus : styles.inactiveStatus
                        }
                      >
                        {treino.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    {treino.descricao && (
                      <p className={styles.description}>{treino.descricao}</p>
                    )}
                    <Link
                      className={styles.workoutAction}
                      to={`/personal/alunos/${aluno.id}/treinos/${treino.id}`}
                    >
                      Ver treino
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </section>
  )
}

export default PersonalAlunoPage
