import { type FormEvent, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import EmptyState from '../../components/feedback/EmptyState'
import ErrorState from '../../components/feedback/ErrorState'
import { getExerciciosAtivos } from '../../services/exercicioService'
import {
  adicionarExercicioAoTreino,
  getExerciciosDoTreino,
} from '../../services/treinoExercicioService'
import { getTreinoPorId } from '../../services/treinoService'
import type { ExercicioResponse } from '../../types/exercicio'
import type { TreinoResponse } from '../../types/treino'
import type {
  TreinoExercicioCreateRequest,
  TreinoExercicioResponse,
} from '../../types/treinoExercicio'
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

function parsePositiveInteger(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) {
    return null
  }

  const parsedValue = Number(value)
  return Number.isSafeInteger(parsedValue) ? parsedValue : null
}

function normalizarTextoOpcional(value: string): string | null {
  const normalizedValue = value.trim()
  return normalizedValue || null
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
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [catalogo, setCatalogo] = useState<ExercicioResponse[] | null>(null)
  const [isCatalogLoading, setIsCatalogLoading] = useState(false)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [exercicioId, setExercicioId] = useState('')
  const [ordem, setOrdem] = useState('1')
  const [seriesPlanejadas, setSeriesPlanejadas] = useState('')
  const [repeticoesPlanejadas, setRepeticoesPlanejadas] = useState('')
  const [cargaPlanejada, setCargaPlanejada] = useState('')
  const [observacoes, setObservacoes] = useState('')

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

    const alunoIdValidado = alunoId
    const treinoIdValidado = treinoId

    async function loadTreinoEPrescricao() {
      setIsLoading(true)
      setTreino(null)
      setExercicios([])
      setCorrectAlunoId(null)
      setErrorMessage(null)
      setCanRetry(false)

      try {
        const treinoResponse = await getTreinoPorId(treinoIdValidado)

        if (!isActive) {
          return
        }

        if (treinoResponse.alunoId !== alunoIdValidado) {
          setCorrectAlunoId(treinoResponse.alunoId)
          return
        }

        const exerciciosResponse = await getExerciciosDoTreino(treinoIdValidado)

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

  const exerciciosDisponiveis = catalogo?.filter(
    (itemCatalogo) =>
      !exercicios.some(
        (itemPrescricao) => itemPrescricao.exercicioId === itemCatalogo.id,
      ),
  ) ?? []

  function getProximaOrdem(): number {
    return exercicios.reduce(
      (maiorOrdem, item) => Math.max(maiorOrdem, item.ordem),
      0,
    ) + 1
  }

  function limparFormulario() {
    setExercicioId('')
    setOrdem(String(getProximaOrdem()))
    setSeriesPlanejadas('')
    setRepeticoesPlanejadas('')
    setCargaPlanejada('')
    setObservacoes('')
    setFormError(null)
  }

  async function carregarCatalogo() {
    setIsCatalogLoading(true)
    setCatalogError(null)

    try {
      setCatalogo(await getExerciciosAtivos())
    } catch (error: unknown) {
      setCatalogError(getErrorMessage(error))
    } finally {
      setIsCatalogLoading(false)
    }
  }

  function abrirFormulario() {
    limparFormulario()
    setSuccessMessage(null)
    setIsFormOpen(true)

    if (catalogo === null && !isCatalogLoading) {
      void carregarCatalogo()
    }
  }

  function cancelarFormulario() {
    limparFormulario()
    setIsFormOpen(false)
  }

  function criarRequest(): TreinoExercicioCreateRequest | null {
    const parsedExercicioId = parsePositiveInteger(exercicioId)
    if (parsedExercicioId === null) {
      setFormError('Selecione um exercício.')
      return null
    }

    const parsedOrdem = parsePositiveInteger(ordem)
    if (parsedOrdem === null) {
      setFormError('A ordem deve ser um número inteiro maior que zero.')
      return null
    }

    let parsedSeries: number | null = null
    if (seriesPlanejadas !== '') {
      parsedSeries = parsePositiveInteger(seriesPlanejadas)
      if (parsedSeries === null) {
        setFormError('As séries devem ser um número inteiro maior que zero.')
        return null
      }
    }

    const repeticoes = normalizarTextoOpcional(repeticoesPlanejadas)
    if (repeticoesPlanejadas !== '' && repeticoes === null) {
      setFormError('As repetições não podem conter apenas espaços.')
      return null
    }

    let parsedCarga: number | null = null
    const carga = cargaPlanejada.trim()
    if (carga) {
      if (!/^\d+(?:[.,]\d{1,2})?$/.test(carga)) {
        setFormError('A carga deve ser positiva ou zero e ter no máximo duas casas decimais.')
        return null
      }

      parsedCarga = Number(carga.replace(',', '.'))
      if (!Number.isFinite(parsedCarga) || parsedCarga < 0) {
        setFormError('Informe uma carga válida.')
        return null
      }
    }

    return {
      exercicioId: parsedExercicioId,
      ordem: parsedOrdem,
      seriesPlanejadas: parsedSeries,
      repeticoesPlanejadas: repeticoes,
      cargaPlanejada: parsedCarga,
      observacoes: normalizarTextoOpcional(observacoes),
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const treinoId = parseId(treinoIdParam)
    if (treinoId === null) {
      setFormError('O identificador do treino é inválido.')
      return
    }

    const request = criarRequest()
    if (request === null) {
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    setSuccessMessage(null)

    try {
      await adicionarExercicioAoTreino(treinoId, request)
      const prescricaoAtualizada = await getExerciciosDoTreino(treinoId)
      setExercicios(prescricaoAtualizada)
      setIsFormOpen(false)
      setExercicioId('')
      setOrdem('1')
      setSeriesPlanejadas('')
      setRepeticoesPlanejadas('')
      setCargaPlanejada('')
      setObservacoes('')
      setSuccessMessage('Exercício adicionado ao treino.')
    } catch (error: unknown) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

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
              <div>
                <h2 id="exercises-title">Exercícios</h2>
                <p>Prescrição atual deste treino.</p>
              </div>
              {!isFormOpen && (
                <button className={styles.addButton} type="button" onClick={abrirFormulario}>
                  Adicionar exercício
                </button>
              )}
            </div>

            {successMessage && (
              <p className={styles.successMessage} role="status" aria-live="polite">
                {successMessage}
              </p>
            )}

            {isFormOpen && (
              <form className={styles.exerciseForm} onSubmit={handleSubmit} noValidate>
                <div className={styles.formHeading}>
                  <div>
                    <h3>Adicionar exercício</h3>
                    <p>Os campos marcados com * são obrigatórios.</p>
                  </div>
                </div>

                {catalogError && (
                  <div className={styles.formError} role="alert">
                    <span>{catalogError}</span>
                    <button type="button" onClick={() => void carregarCatalogo()}>
                      Tentar novamente
                    </button>
                  </div>
                )}

                {formError && (
                  <p className={styles.formError} role="alert">
                    {formError}
                  </p>
                )}

                {isCatalogLoading ? (
                  <p className={styles.catalogStatus} role="status">
                    Carregando catálogo...
                  </p>
                ) : catalogo !== null && exerciciosDisponiveis.length === 0 ? (
                  <p className={styles.catalogStatus} role="status">
                    Não há exercícios ativos disponíveis para adicionar.
                  </p>
                ) : (
                  <div className={styles.formGrid}>
                    <div className={styles.fullField}>
                      <label htmlFor="prescription-exercise">Exercício *</label>
                      <select
                        id="prescription-exercise"
                        value={exercicioId}
                        onChange={(event) => setExercicioId(event.target.value)}
                        required
                        disabled={isSubmitting || catalogo === null}
                      >
                        <option value="">Selecione um exercício</option>
                        {exerciciosDisponiveis.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="prescription-order">Ordem *</label>
                      <input
                        id="prescription-order"
                        type="number"
                        min="1"
                        step="1"
                        value={ordem}
                        onChange={(event) => setOrdem(event.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label htmlFor="prescription-series">Séries</label>
                      <input
                        id="prescription-series"
                        type="number"
                        min="1"
                        step="1"
                        value={seriesPlanejadas}
                        onChange={(event) => setSeriesPlanejadas(event.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label htmlFor="prescription-repetitions">Repetições</label>
                      <input
                        id="prescription-repetitions"
                        type="text"
                        value={repeticoesPlanejadas}
                        onChange={(event) => setRepeticoesPlanejadas(event.target.value)}
                        disabled={isSubmitting}
                        placeholder="Ex.: 8-12"
                      />
                    </div>

                    <div>
                      <label htmlFor="prescription-load">Carga (kg)</label>
                      <input
                        id="prescription-load"
                        type="text"
                        inputMode="decimal"
                        value={cargaPlanejada}
                        onChange={(event) => setCargaPlanejada(event.target.value)}
                        disabled={isSubmitting}
                        placeholder="Ex.: 12,5"
                      />
                    </div>

                    <div className={styles.fullField}>
                      <label htmlFor="prescription-notes">Observações</label>
                      <textarea
                        id="prescription-notes"
                        value={observacoes}
                        onChange={(event) => setObservacoes(event.target.value)}
                        disabled={isSubmitting}
                        rows={4}
                      />
                    </div>
                  </div>
                )}

                <div className={styles.formActions}>
                  <button
                    className={styles.cancelButton}
                    type="button"
                    onClick={cancelarFormulario}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    className={styles.submitButton}
                    type="submit"
                    disabled={
                      isSubmitting ||
                      isCatalogLoading ||
                      catalogError !== null ||
                      exerciciosDisponiveis.length === 0
                    }
                  >
                    {isSubmitting ? 'Adicionando...' : 'Adicionar'}
                  </button>
                </div>
              </form>
            )}

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
