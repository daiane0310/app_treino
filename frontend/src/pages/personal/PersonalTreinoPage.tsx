import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import EmptyState from '../../components/feedback/EmptyState'
import ErrorState from '../../components/feedback/ErrorState'
import { getExerciciosDoTreino } from '../../services/treinoExercicioService'
import { getTreinoPorId } from '../../services/treinoService'
import type { TreinoResponse } from '../../types/treino'
import type { TreinoExercicioResponse } from '../../types/treinoExercicio'
import { getErrorMessage } from '../../utils/getErrorMessage'
import styles from './PersonalTreinoPage.module.css'

function parseId(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) {
    return null
  }

  const id = Number(value)
  return Number.isSafeInteger(id) ? id : null
}

function formatCarga(carga: number): string {
  return `${new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
  }).format(carga)} kg`
}

function hasText(value: string | null): value is string {
  return Boolean(value?.trim())
}

function PersonalTreinoPage() {
  const { alunoId: alunoIdParam, treinoId: treinoIdParam } = useParams<{
    alunoId: string
    treinoId: string
  }>()
  const [treino, setTreino] = useState<TreinoResponse | null>(null)
  const [exercicios, setExercicios] = useState<TreinoExercicioResponse[]>([])
  const [correctAlunoId, setCorrectAlunoId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [canRetry, setCanRetry] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isActive = true
    const alunoId = parseId(alunoIdParam)
    const treinoId = parseId(treinoIdParam)

    if (alunoId === null || treinoId === null) {
      setTreino(null)
      setExercicios([])
      setCorrectAlunoId(null)
      setErrorMessage('O identificador do aluno ou do treino é inválido.')
      setCanRetry(false)
      setIsLoading(false)
      return () => {
        isActive = false
      }
    }

    async function loadTreinoEPrescricao() {
      setIsLoading(true)
      setTreino(null)
      setExercicios([])
      setCorrectAlunoId(null)
      setErrorMessage(null)
      setCanRetry(false)

      try {
        const treinoResponse = await getTreinoPorId(treinoId)

        if (!isActive) {
          return
        }

        if (treinoResponse.alunoId !== alunoId) {
          setCorrectAlunoId(treinoResponse.alunoId)
          return
        }

        const exerciciosResponse = await getExerciciosDoTreino(treinoId)

        if (isActive) {
          setTreino(treinoResponse)
          setExercicios(exerciciosResponse)
        }
      } catch (error: unknown) {
        if (isActive) {
          setErrorMessage(getErrorMessage(error))
          setCanRetry(true)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadTreinoEPrescricao()

    return () => {
      isActive = false
    }
  }, [alunoIdParam, treinoIdParam, reloadKey])

  const alunoId = parseId(alunoIdParam)

  return (
    <section className={styles.page}>
      {alunoId !== null && (
        <Link className={styles.backLink} to={`/personal/alunos/${alunoId}`}>
          ← Voltar para o aluno
        </Link>
      )}

      {isLoading && (
        <div className={styles.loading} role="status" aria-live="polite">
          Carregando treino e exercícios...
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

      {!isLoading && !errorMessage && correctAlunoId !== null && (
        <section className={styles.consistencyError} role="alert">
          <h1>Treino associado a outro aluno</h1>
          <p>
            O treino informado não pertence ao aluno presente nesta URL.
          </p>
          <Link to={`/personal/alunos/${correctAlunoId}`}>
            Ir para o aluno correto
          </Link>
        </section>
      )}

      {!isLoading && !errorMessage && correctAlunoId === null && treino && (
        <>
          <header className={styles.workoutHeader}>
            <div className={styles.titleRow}>
              <div>
                <p className={styles.eyebrow}>Treino do aluno</p>
                <h1>{treino.nome}</h1>
              </div>
              <span
                className={treino.ativo ? styles.activeStatus : styles.inactiveStatus}
              >
                {treino.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            {hasText(treino.descricao) && (
              <p className={styles.description}>{treino.descricao}</p>
            )}
            <p className={styles.studentName}>Aluno: {treino.alunoNome}</p>
          </header>

          <section className={styles.prescription} aria-labelledby="exercises-title">
            <div className={styles.sectionHeader}>
              <h2 id="exercises-title">Exercícios</h2>
              <p>Prescrição atual deste treino.</p>
            </div>

            {exercicios.length === 0 ? (
              <EmptyState
                title="Nenhum exercício prescrito"
                description="Este treino ainda não possui exercícios cadastrados."
              />
            ) : (
              <ol className={styles.exerciseList} aria-label="Exercícios prescritos">
                {exercicios.map((item) => {
                  const hasMetrics =
                    item.seriesPlanejadas !== null ||
                    hasText(item.repeticoesPlanejadas) ||
                    item.cargaPlanejada !== null

                  return (
                    <li className={styles.exerciseCard} key={item.id}>
                      <div className={styles.exerciseHeading}>
                        <span className={styles.order} aria-label={`Ordem ${item.ordem}`}>
                          {String(item.ordem).padStart(2, '0')}
                        </span>
                        <h3>{item.exercicioNome}</h3>
                      </div>

                      {hasMetrics && (
                        <dl className={styles.metrics}>
                          {item.seriesPlanejadas !== null && (
                            <div>
                              <dt>Séries</dt>
                              <dd>{item.seriesPlanejadas}</dd>
                            </div>
                          )}
                          {hasText(item.repeticoesPlanejadas) && (
                            <div>
                              <dt>Repetições</dt>
                              <dd>{item.repeticoesPlanejadas}</dd>
                            </div>
                          )}
                          {item.cargaPlanejada !== null && (
                            <div>
                              <dt>Carga</dt>
                              <dd>{formatCarga(item.cargaPlanejada)}</dd>
                            </div>
                          )}
                        </dl>
                      )}

                      {hasText(item.observacoes) && (
                        <div className={styles.notes}>
                          <strong>Observação</strong>
                          <p>{item.observacoes}</p>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ol>
            )}
          </section>
        </>
      )}
    </section>
  )
}

export default PersonalTreinoPage
