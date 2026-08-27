import { type FormEvent, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import EmptyState from '../../components/feedback/EmptyState'
import ErrorState from '../../components/feedback/ErrorState'
import { getMeusAlunos } from '../../services/alunoService'
import {
  criarTreinoParaAluno,
  getTreinosDoAluno,
} from '../../services/treinoService'
import type { AlunoResumoResponse } from '../../types/aluno'
import type { TreinoCreateRequest, TreinoResponse } from '../../types/treino'
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
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [novoTreino, setNovoTreino] = useState<TreinoResponse | null>(null)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

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

  function limparFormulario() {
    setNome('')
    setDescricao('')
    setAtivo(true)
    setFormError(null)
  }

  function abrirFormulario() {
    limparFormulario()
    setIsFormOpen(true)
    setSuccessMessage(null)
  }

  function cancelarFormulario() {
    limparFormulario()
    setIsFormOpen(false)
  }

  function criarRequest(): TreinoCreateRequest | null {
    const nomeNormalizado = nome.trim()
    if (!nomeNormalizado) {
      setFormError('Nome do treino é obrigatório.')
      return null
    }
    if (nomeNormalizado.length > 255) {
      setFormError('Nome do treino deve ter no máximo 255 caracteres.')
      return null
    }

    const descricaoNormalizada = descricao.trim()
    return {
      nome: nomeNormalizado,
      descricao: descricaoNormalizada || null,
      ativo,
    }
  }

  async function recarregarListaDeTreinos(alunoId: number): Promise<boolean> {
    try {
      const treinosAtualizados = await getTreinosDoAluno(alunoId)
      setTreinos(treinosAtualizados)
      setRefreshError(null)
      return true
    } catch (error: unknown) {
      setRefreshError(
        `O treino foi criado, mas a lista não pôde ser atualizada. ${getErrorMessage(error)}`,
      )
      return false
    }
  }

  async function handleRetryRefresh() {
    const alunoId = parseAlunoId(alunoIdParam)
    if (alunoId === null || isRefreshing) {
      return
    }

    setIsRefreshing(true)
    await recarregarListaDeTreinos(alunoId)
    setIsRefreshing(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const alunoId = parseAlunoId(alunoIdParam)
    if (alunoId === null) {
      setFormError('O identificador do aluno é inválido.')
      return
    }

    const request = criarRequest()
    if (request === null) {
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    setSuccessMessage(null)
    setRefreshError(null)

    try {
      const treinoCriado = await criarTreinoParaAluno(alunoId, request)
      setNovoTreino(treinoCriado)
      setIsFormOpen(false)
      limparFormulario()
      setSuccessMessage('Treino criado com sucesso.')
      await recarregarListaDeTreinos(alunoId)
    } catch (error: unknown) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

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
              <div>
                <h2 id="workouts-title">Treinos</h2>
                <p>Treinos atualmente atribuídos a este aluno.</p>
              </div>
              {!isFormOpen && (
                <button
                  className={styles.createButton}
                  type="button"
                  onClick={abrirFormulario}
                  disabled={isSubmitting}
                >
                  Criar treino
                </button>
              )}
            </div>

            {successMessage && novoTreino && (
              <div className={styles.successMessage} role="status" aria-live="polite">
                <span>{successMessage}</span>
                <Link
                  to={`/personal/alunos/${aluno.id}/treinos/${novoTreino.id}`}
                >
                  Montar treino
                </Link>
              </div>
            )}

            {refreshError && (
              <div className={styles.refreshError} role="alert">
                <span>{refreshError}</span>
                <button
                  type="button"
                  onClick={() => void handleRetryRefresh()}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? 'Recarregando...' : 'Tentar recarregar'}
                </button>
              </div>
            )}

            {isFormOpen && (
              <form className={styles.createForm} onSubmit={handleSubmit} noValidate>
                <div className={styles.formHeading}>
                  <h3>Criar treino</h3>
                  <p>Preencha os dados do novo treino do aluno.</p>
                </div>

                {formError && (
                  <p className={styles.formError} role="alert">
                    {formError}
                  </p>
                )}

                <div className={styles.formFields}>
                  <div>
                    <label htmlFor="workout-name">Nome do treino *</label>
                    <input
                      id="workout-name"
                      type="text"
                      value={nome}
                      onChange={(event) => setNome(event.target.value)}
                      maxLength={255}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="workout-description">Descrição</label>
                    <textarea
                      id="workout-description"
                      value={descricao}
                      onChange={(event) => setDescricao(event.target.value)}
                      rows={4}
                      disabled={isSubmitting}
                    />
                  </div>

                  <label className={styles.checkboxField} htmlFor="workout-active">
                    <input
                      id="workout-active"
                      type="checkbox"
                      checked={ativo}
                      onChange={(event) => setAtivo(event.target.checked)}
                      disabled={isSubmitting}
                    />
                    <span>Treino ativo</span>
                  </label>
                </div>

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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Criando...' : 'Criar treino'}
                  </button>
                </div>
              </form>
            )}

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
