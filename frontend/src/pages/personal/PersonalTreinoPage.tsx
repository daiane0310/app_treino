import axios from 'axios'
import { type FormEvent, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import EmptyState from '../../components/feedback/EmptyState'
import ErrorState from '../../components/feedback/ErrorState'
import { getExerciciosAtivos } from '../../services/exercicioService'
import {
  adicionarExercicioAoTreino,
  atualizarExercicioDoTreino,
  getExerciciosDoTreino,
  removerExercicioDoTreino,
  reordenarExerciciosDoTreino,
} from '../../services/treinoExercicioService'
import { atualizarTreino, getTreinoPorId } from '../../services/treinoService'
import type { ExercicioResponse } from '../../types/exercicio'
import type { TreinoResponse, TreinoUpdateRequest } from '../../types/treino'
import type {
  TreinoExercicioCreateRequest,
  TreinoExercicioReordenarRequest,
  TreinoExercicioResponse,
  TreinoExercicioUpdateRequest,
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
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editSeries, setEditSeries] = useState('')
  const [editRepeticoes, setEditRepeticoes] = useState('')
  const [editCarga, setEditCarga] = useState('')
  const [editObservacoes, setEditObservacoes] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [mutationRefreshError, setMutationRefreshError] = useState<string | null>(null)
  const [reorderItems, setReorderItems] = useState<
    TreinoExercicioResponse[] | null
  >(null)
  const [isSavingOrder, setIsSavingOrder] = useState(false)
  const [isReloadingOrder, setIsReloadingOrder] = useState(false)
  const [reorderError, setReorderError] = useState<string | null>(null)
  const [canReloadOrder, setCanReloadOrder] = useState(false)
  const [isWorkoutEditing, setIsWorkoutEditing] = useState(false)
  const [workoutName, setWorkoutName] = useState('')
  const [workoutDescription, setWorkoutDescription] = useState('')
  const [isWorkoutSaving, setIsWorkoutSaving] = useState(false)
  const [workoutEditError, setWorkoutEditError] = useState<string | null>(null)
  const [workoutSuccessMessage, setWorkoutSuccessMessage] = useState<
    string | null
  >(null)

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

  const hasReorderChanges = reorderItems !== null && (
    reorderItems.length !== exercicios.length ||
    reorderItems.some((item, index) => item.id !== exercicios[index]?.id)
  )

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
    setEditingId(null)
    setEditError(null)
    limparFormulario()
    setSuccessMessage(null)
    setIsFormOpen(true)

    if (catalogo === null && !isCatalogLoading) {
      void carregarCatalogo()
    }
  }

  function iniciarEdicao(item: TreinoExercicioResponse) {
    setIsFormOpen(false)
    setFormError(null)
    setEditingId(item.id)
    setEditSeries(item.seriesPlanejadas?.toString() ?? '')
    setEditRepeticoes(item.repeticoesPlanejadas ?? '')
    setEditCarga(item.cargaPlanejada?.toString() ?? '')
    setEditObservacoes(item.observacoes ?? '')
    setEditError(null)
    setActionError(null)
    setSuccessMessage(null)
  }

  function cancelarEdicao() {
    setEditingId(null)
    setEditError(null)
  }

  function criarUpdateRequest(
    item: TreinoExercicioResponse,
  ): TreinoExercicioUpdateRequest | null {
    let parsedSeries: number | null = null
    if (editSeries !== '') {
      parsedSeries = parsePositiveInteger(editSeries)
      if (parsedSeries === null) {
        setEditError('As séries devem ser um número inteiro maior que zero.')
        return null
      }
    }

    const repeticoes = normalizarTextoOpcional(editRepeticoes)
    if (editRepeticoes !== '' && repeticoes === null) {
      setEditError('As repetições não podem conter apenas espaços.')
      return null
    }

    let parsedCarga: number | null = null
    const carga = editCarga.trim()
    if (carga) {
      if (!/^\d+(?:[.,]\d{1,2})?$/.test(carga)) {
        setEditError(
          'A carga deve ser positiva ou zero e ter no máximo duas casas decimais.',
        )
        return null
      }

      parsedCarga = Number(carga.replace(',', '.'))
      if (!Number.isFinite(parsedCarga) || parsedCarga < 0) {
        setEditError('Informe uma carga válida.')
        return null
      }
    }

    return {
      ordem: item.ordem,
      seriesPlanejadas: parsedSeries,
      repeticoesPlanejadas: repeticoes,
      cargaPlanejada: parsedCarga,
      observacoes: normalizarTextoOpcional(editObservacoes),
    }
  }

  async function recarregarAposMutacao(
    treinoId: number,
    successMessageValue: string,
  ) {
    try {
      const prescricaoAtualizada = await getExerciciosDoTreino(treinoId)
      setExercicios(prescricaoAtualizada)
      setMutationRefreshError(null)
      setSuccessMessage(successMessageValue)
    } catch (error: unknown) {
      setSuccessMessage(null)
      setMutationRefreshError(
        `A operação foi concluída, mas não foi possível atualizar a lista. ${getErrorMessage(error)}`,
      )
    }
  }

  async function handleEditSubmit(
    event: FormEvent<HTMLFormElement>,
    item: TreinoExercicioResponse,
  ) {
    event.preventDefault()

    if (savingId !== null || removingId !== null) {
      return
    }

    const treinoId = parseId(treinoIdParam)
    if (treinoId === null) {
      setEditError('O identificador do treino é inválido.')
      return
    }

    const request = criarUpdateRequest(item)
    if (request === null) {
      return
    }

    setSavingId(item.id)
    setEditError(null)
    setActionError(null)
    setSuccessMessage(null)

    try {
      await atualizarExercicioDoTreino(treinoId, item.id, request)
      setEditingId(null)
      await recarregarAposMutacao(treinoId, 'Prescrição atualizada.')
    } catch (error: unknown) {
      setEditError(getErrorMessage(error))
    } finally {
      setSavingId(null)
    }
  }

  async function handleRemove(item: TreinoExercicioResponse) {
    const confirmed = window.confirm(
      'Remover exercício do treino?\n\nEssa ação remove o exercício da prescrição atual, mas não apaga o histórico de execuções anteriores.',
    )

    if (!confirmed || savingId !== null || removingId !== null) {
      return
    }

    const treinoId = parseId(treinoIdParam)
    if (treinoId === null) {
      setErrorMessage('O identificador do treino é inválido.')
      return
    }

    setRemovingId(item.id)
    setSuccessMessage(null)
    setActionError(null)
    setMutationRefreshError(null)

    try {
      await removerExercicioDoTreino(treinoId, item.id)
      if (editingId === item.id) {
        setEditingId(null)
      }
      await recarregarAposMutacao(treinoId, 'Exercício removido do treino.')
    } catch (error: unknown) {
      setActionError(getErrorMessage(error))
    } finally {
      setRemovingId(null)
    }
  }

  function iniciarReordenacao() {
    if (
      exercicios.length < 2 ||
      isFormOpen ||
      editingId !== null ||
      savingId !== null ||
      removingId !== null ||
      mutationRefreshError !== null
    ) {
      return
    }

    setReorderItems([...exercicios])
    setReorderError(null)
    setCanReloadOrder(false)
    setSuccessMessage(null)
    setActionError(null)
  }

  function moverItem(index: number, direction: -1 | 1) {
    if (isSavingOrder || isReloadingOrder) {
      return
    }

    setReorderItems((currentItems) => {
      if (currentItems === null) {
        return null
      }

      const targetIndex = index + direction
      if (targetIndex < 0 || targetIndex >= currentItems.length) {
        return currentItems
      }

      const nextItems = [...currentItems]
      const currentItem = nextItems[index]
      const targetItem = nextItems[targetIndex]
      nextItems[index] = targetItem
      nextItems[targetIndex] = currentItem
      return nextItems
    })
  }

  function cancelarReordenacao() {
    setReorderItems(null)
    setReorderError(null)
    setCanReloadOrder(false)
  }

  async function salvarReordenacao() {
    if (
      reorderItems === null ||
      !hasReorderChanges ||
      isSavingOrder ||
      isReloadingOrder
    ) {
      return
    }

    const treinoId = parseId(treinoIdParam)
    if (treinoId === null) {
      setReorderError('O identificador do treino é inválido.')
      return
    }

    const request: TreinoExercicioReordenarRequest = {
      itens: reorderItems.map((item, index) => ({
        treinoExercicioId: item.id,
        ordem: index + 1,
      })),
    }

    setIsSavingOrder(true)
    setReorderError(null)
    setCanReloadOrder(false)
    setSuccessMessage(null)

    try {
      const exerciciosReordenados = await reordenarExerciciosDoTreino(
        treinoId,
        request,
      )
      setExercicios(exerciciosReordenados)
      setReorderItems(null)
      setSuccessMessage('Ordem dos exercícios atualizada.')
    } catch (error: unknown) {
      setReorderError(getErrorMessage(error))
      setCanReloadOrder(
        axios.isAxiosError(error) &&
          (error.response?.status === 404 || error.response?.status === 409),
      )
    } finally {
      setIsSavingOrder(false)
    }
  }

  async function recarregarDuranteReordenacao() {
    const treinoId = parseId(treinoIdParam)
    if (treinoId === null || isSavingOrder || isReloadingOrder) {
      return
    }

    setIsReloadingOrder(true)
    setReorderError(null)

    try {
      const prescricaoAtualizada = await getExerciciosDoTreino(treinoId)
      setExercicios(prescricaoAtualizada)
      setReorderItems(null)
      setCanReloadOrder(false)
    } catch (error: unknown) {
      setReorderError(getErrorMessage(error))
      setCanReloadOrder(true)
    } finally {
      setIsReloadingOrder(false)
    }
  }

  function iniciarEdicaoDoTreino() {
    if (
      treino === null ||
      isFormOpen ||
      editingId !== null ||
      savingId !== null ||
      removingId !== null ||
      reorderItems !== null ||
      isSubmitting ||
      mutationRefreshError !== null
    ) {
      return
    }

    setWorkoutName(treino.nome)
    setWorkoutDescription(treino.descricao ?? '')
    setWorkoutEditError(null)
    setWorkoutSuccessMessage(null)
    setIsWorkoutEditing(true)
  }

  function cancelarEdicaoDoTreino() {
    setWorkoutName('')
    setWorkoutDescription('')
    setWorkoutEditError(null)
    setIsWorkoutEditing(false)
  }

  async function handleWorkoutSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (treino === null || isWorkoutSaving) {
      return
    }

    const treinoId = parseId(treinoIdParam)
    if (treinoId === null) {
      setWorkoutEditError('O identificador do treino é inválido.')
      return
    }

    const normalizedName = workoutName.trim()
    if (!normalizedName) {
      setWorkoutEditError('Nome do treino é obrigatório.')
      return
    }
    if (normalizedName.length > 255) {
      setWorkoutEditError('Nome do treino deve ter no máximo 255 caracteres.')
      return
    }

    const normalizedDescription = workoutDescription.trim()
    const request: TreinoUpdateRequest = {
      nome: normalizedName,
      descricao: normalizedDescription || null,
      ativo: treino.ativo,
    }

    setIsWorkoutSaving(true)
    setWorkoutEditError(null)
    setWorkoutSuccessMessage(null)

    try {
      const updatedWorkout = await atualizarTreino(treinoId, request)
      setTreino(updatedWorkout)
      setWorkoutName('')
      setWorkoutDescription('')
      setIsWorkoutEditing(false)
      setWorkoutSuccessMessage('Treino atualizado com sucesso.')
    } catch (error: unknown) {
      setWorkoutEditError(getErrorMessage(error))
    } finally {
      setIsWorkoutSaving(false)
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

            {workoutSuccessMessage && (
              <p
                className={styles.workoutSuccessMessage}
                role="status"
                aria-live="polite"
              >
                {workoutSuccessMessage}
              </p>
            )}

            {isWorkoutEditing ? (
              <form
                className={styles.workoutEditForm}
                onSubmit={handleWorkoutSubmit}
                noValidate
              >
                {workoutEditError && (
                  <p className={styles.formError} role="alert">
                    {workoutEditError}
                  </p>
                )}

                <div className={styles.workoutEditFields}>
                  <div>
                    <label htmlFor="workout-edit-name">Nome *</label>
                    <input
                      id="workout-edit-name"
                      type="text"
                      value={workoutName}
                      onChange={(event) => setWorkoutName(event.target.value)}
                      maxLength={255}
                      required
                      disabled={isWorkoutSaving}
                    />
                  </div>
                  <div>
                    <label htmlFor="workout-edit-description">Descrição</label>
                    <textarea
                      id="workout-edit-description"
                      value={workoutDescription}
                      onChange={(event) => setWorkoutDescription(event.target.value)}
                      rows={4}
                      disabled={isWorkoutSaving}
                    />
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button
                    className={styles.cancelButton}
                    type="button"
                    onClick={cancelarEdicaoDoTreino}
                    disabled={isWorkoutSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    className={styles.submitButton}
                    type="submit"
                    disabled={isWorkoutSaving}
                  >
                    {isWorkoutSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.workoutHeaderActions}>
                <button
                  className={styles.editWorkoutButton}
                  type="button"
                  onClick={iniciarEdicaoDoTreino}
                  disabled={
                    isFormOpen ||
                    editingId !== null ||
                    savingId !== null ||
                    removingId !== null ||
                    reorderItems !== null ||
                    isSubmitting ||
                    mutationRefreshError !== null
                  }
                >
                  Editar treino
                </button>
              </div>
            )}
          </header>

          <section className={styles.prescription} aria-labelledby="exercises-title">
            <div className={styles.sectionHeader}>
              <div>
                <h2 id="exercises-title">Exercícios</h2>
                <p>Prescrição atual deste treino.</p>
              </div>
              {!isFormOpen && editingId === null && reorderItems === null && (
                <div className={styles.headerActions}>
                  <button
                    className={styles.reorderButton}
                    type="button"
                    onClick={iniciarReordenacao}
                    disabled={
                      isWorkoutEditing ||
                      exercicios.length < 2 ||
                      savingId !== null ||
                      removingId !== null ||
                      mutationRefreshError !== null
                    }
                  >
                    Reordenar
                  </button>
                  <button
                    className={styles.addButton}
                    type="button"
                    onClick={abrirFormulario}
                    disabled={
                      isWorkoutEditing ||
                      savingId !== null ||
                      removingId !== null ||
                      mutationRefreshError !== null
                    }
                  >
                    Adicionar exercício
                  </button>
                </div>
              )}
            </div>

            {successMessage && (
              <p className={styles.successMessage} role="status" aria-live="polite">
                {successMessage}
              </p>
            )}

            {actionError && (
              <p className={styles.pageActionError} role="alert">
                {actionError}
              </p>
            )}

            {mutationRefreshError && (
              <div className={styles.mutationError} role="alert">
                <span>{mutationRefreshError}</span>
                <button
                  type="button"
                  onClick={() => {
                    setMutationRefreshError(null)
                    setReloadKey((current) => current + 1)
                  }}
                >
                  Tentar recarregar
                </button>
              </div>
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

            {reorderItems !== null ? (
              <section className={styles.reorderPanel} aria-labelledby="reorder-title">
                <div className={styles.reorderHeading}>
                  <div>
                    <h3 id="reorder-title">Reordenar exercícios</h3>
                    <p>Use os controles para definir a sequência do treino.</p>
                  </div>
                </div>

                {reorderError && (
                  <div className={styles.reorderError} role="alert">
                    <span>{reorderError}</span>
                    {canReloadOrder && (
                      <button
                        type="button"
                        onClick={() => void recarregarDuranteReordenacao()}
                        disabled={isSavingOrder || isReloadingOrder}
                      >
                        {isReloadingOrder ? 'Recarregando...' : 'Recarregar prescrição'}
                      </button>
                    )}
                  </div>
                )}

                <ol className={styles.reorderList} aria-label="Nova ordem dos exercícios">
                  {reorderItems.map((item, index) => (
                    <li className={styles.reorderItem} key={item.id}>
                      <div className={styles.reorderIdentity}>
                        <span
                          className={styles.order}
                          aria-label={`Posição ${index + 1}`}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <strong>{item.exercicioNome}</strong>
                      </div>
                      <div className={styles.moveActions}>
                        <button
                          type="button"
                          onClick={() => moverItem(index, -1)}
                          disabled={index === 0 || isSavingOrder || isReloadingOrder}
                          aria-label={`Subir ${item.exercicioNome}`}
                        >
                          Subir
                        </button>
                        <button
                          type="button"
                          onClick={() => moverItem(index, 1)}
                          disabled={
                            index === reorderItems.length - 1 ||
                            isSavingOrder ||
                            isReloadingOrder
                          }
                          aria-label={`Descer ${item.exercicioNome}`}
                        >
                          Descer
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className={styles.formActions}>
                  <button
                    className={styles.cancelButton}
                    type="button"
                    onClick={cancelarReordenacao}
                    disabled={isSavingOrder || isReloadingOrder}
                  >
                    Cancelar
                  </button>
                  <button
                    className={styles.submitButton}
                    type="button"
                    onClick={() => void salvarReordenacao()}
                    disabled={
                      !hasReorderChanges || isSavingOrder || isReloadingOrder
                    }
                  >
                    {isSavingOrder ? 'Salvando ordem...' : 'Salvar ordem'}
                  </button>
                </div>
              </section>
            ) : exercicios.length === 0 ? (
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

                      {editingId === item.id ? (
                        <form
                          className={styles.editForm}
                          onSubmit={(event) => void handleEditSubmit(event, item)}
                          noValidate
                        >
                          <div className={styles.editIdentity}>
                            <strong>{item.exercicioNome}</strong>
                            <span>Ordem {item.ordem}</span>
                          </div>

                          {editError && (
                            <p className={styles.formError} role="alert">
                              {editError}
                            </p>
                          )}

                          <div className={styles.formGrid}>
                            <div>
                              <label htmlFor={`edit-series-${item.id}`}>Séries</label>
                              <input
                                id={`edit-series-${item.id}`}
                                type="number"
                                min="1"
                                step="1"
                                value={editSeries}
                                onChange={(event) => setEditSeries(event.target.value)}
                                disabled={savingId === item.id}
                              />
                            </div>

                            <div>
                              <label htmlFor={`edit-repetitions-${item.id}`}>
                                Repetições
                              </label>
                              <input
                                id={`edit-repetitions-${item.id}`}
                                type="text"
                                value={editRepeticoes}
                                onChange={(event) => setEditRepeticoes(event.target.value)}
                                disabled={savingId === item.id}
                              />
                            </div>

                            <div>
                              <label htmlFor={`edit-load-${item.id}`}>Carga (kg)</label>
                              <input
                                id={`edit-load-${item.id}`}
                                type="text"
                                inputMode="decimal"
                                value={editCarga}
                                onChange={(event) => setEditCarga(event.target.value)}
                                disabled={savingId === item.id}
                              />
                            </div>

                            <div className={styles.fullField}>
                              <label htmlFor={`edit-notes-${item.id}`}>Observações</label>
                              <textarea
                                id={`edit-notes-${item.id}`}
                                value={editObservacoes}
                                onChange={(event) => setEditObservacoes(event.target.value)}
                                disabled={savingId === item.id}
                                rows={4}
                              />
                            </div>
                          </div>

                          <div className={styles.formActions}>
                            <button
                              className={styles.cancelButton}
                              type="button"
                              onClick={cancelarEdicao}
                              disabled={savingId === item.id}
                            >
                              Cancelar
                            </button>
                            <button
                              className={styles.submitButton}
                              type="submit"
                              disabled={savingId === item.id}
                            >
                              {savingId === item.id ? 'Salvando...' : 'Salvar'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className={styles.cardActions}>
                          <button
                            className={styles.editButton}
                            type="button"
                            onClick={() => iniciarEdicao(item)}
                            disabled={
                              editingId !== null ||
                              isWorkoutEditing ||
                              savingId !== null ||
                              removingId !== null ||
                              mutationRefreshError !== null
                            }
                          >
                            Editar
                          </button>
                          <button
                            className={styles.removeButton}
                            type="button"
                            onClick={() => void handleRemove(item)}
                            disabled={
                              editingId !== null ||
                              isWorkoutEditing ||
                              savingId !== null ||
                              removingId !== null ||
                              mutationRefreshError !== null
                            }
                          >
                            {removingId === item.id ? 'Removendo...' : 'Remover'}
                          </button>
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
