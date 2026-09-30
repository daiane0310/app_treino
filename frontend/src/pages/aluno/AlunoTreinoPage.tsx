import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ErrorState from '../../components/feedback/ErrorState'
import PageLoader from '../../components/feedback/PageLoader'
import { getTreinoPorId } from '../../services/treinoService'
import { getExerciciosDoTreino } from '../../services/treinoExercicioService'
import { getMinhasExecucoes, iniciarExecucao } from '../../services/execucaoTreinoService'
import type { TreinoResponse } from '../../types/treino'
import type { TreinoExercicioResponse } from '../../types/treinoExercicio'
import { alunoError, parseAlunoResourceId } from './alunoUtils'
import PrescricaoList from './PrescricaoList'
import styles from './Aluno.module.css'

interface TreinoData {
  treino: TreinoResponse
  exercicios: TreinoExercicioResponse[]
  execucaoId: number | null
}

async function buscarSessao(treinoId: number): Promise<number | null> {
  const execucoes = await getMinhasExecucoes()
  return execucoes.find(item => item.treinoId === treinoId && item.status === 'EM_ANDAMENTO')?.id ?? null
}

// The keyed component also isolates pending requests when the route changes.
export default function AlunoTreinoPage() {
  const { treinoId } = useParams()
  const id = parseAlunoResourceId(treinoId)
  return id === null ? <ErrorState message="O identificador do treino é inválido." /> : <TreinoDetalhe key={id} id={id} />
}

function TreinoDetalhe({ id }: { id: number }) {
  const navigate = useNavigate()
  const mounted = useRef(false)
  const locked = useRef(false)
  const [data, setData] = useState<TreinoData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [uncertain, setUncertain] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    let active = true
    setData(null)
    setError(null)
    Promise.all([getTreinoPorId(id), getExerciciosDoTreino(id), buscarSessao(id)])
      .then(([treino, exercicios, execucaoId]) => {
        if (active) setData({ treino, exercicios, execucaoId })
      }).catch((err: unknown) => { if (active) setError(alunoError(err)) })
    return () => { active = false }
  }, [id, reload])

  function abrirExecucao(execucaoId: number) {
    if (mounted.current) navigate(`/aluno/execucoes/${execucaoId}`)
  }

  async function iniciarOuVerificar() {
    if (!data || locked.current) return
    locked.current = true
    setBusy(true)
    setActionError(null)
    try {
      // Always reconcile before a POST, including explicit user retries.
      const existing = await buscarSessao(id)
      if (!mounted.current) return
      if (existing !== null) { abrirExecucao(existing); return }
      const treino = await getTreinoPorId(id)
      if (!mounted.current) return
      setData(current => current ? { ...current, treino, execucaoId: null } : current)
      if (uncertain) {
        setUncertain(false)
        setActionError('Nenhuma sessão em andamento foi encontrada. Confira o treino antes de tentar iniciar novamente.')
        return
      }
      if (!treino.ativo) {
        setActionError('Este treino está inativo. Não é possível iniciar uma nova execução.')
        return
      }
      try {
        const result = await iniciarExecucao(id)
        abrirExecucao(result.id)
      } catch (err: unknown) {
        if (!mounted.current) return
        // Never retry a creation automatically: a timeout may hide a successful POST.
        setUncertain(true)
        try {
          const recovered = await buscarSessao(id)
          if (!mounted.current) return
          if (recovered !== null) { abrirExecucao(recovered); return }
          setActionError(`${alunoError(err)} Nenhuma sessão foi localizada. Verifique novamente antes de iniciar outra tentativa.`)
          const refreshed = await getTreinoPorId(id)
          if (mounted.current) setData(current => current ? { ...current, treino: refreshed } : current)
        } catch {
          if (mounted.current) setActionError('Não foi possível confirmar se o treino foi iniciado. Verifique a sessão antes de tentar novamente.')
        }
      }
    } catch (err: unknown) {
      if (mounted.current) setActionError(alunoError(err))
    } finally {
      locked.current = false
      if (mounted.current) setBusy(false)
    }
  }

  if (error) return <ErrorState message={error} onRetry={() => setReload(value => value + 1)} />
  if (!data) return <PageLoader />
  const { treino, exercicios, execucaoId } = data
  return <main className={styles.page}>
    <Link to="/aluno">Voltar aos meus treinos</Link>
    <header className={styles.card}>
      <span className={treino.ativo ? styles.active : styles.inactive}>{treino.ativo ? 'Ativo' : 'Inativo'}</span>
      <h1>{treino.nome}</h1>
      {treino.descricao && <p className={styles.text}>{treino.descricao}</p>}
      {!treino.ativo && <p>Este treino está inativo. Uma sessão já iniciada continua disponível.</p>}
      {execucaoId !== null ? <Link className={styles.button} to={`/aluno/execucoes/${execucaoId}`}>Continuar treino</Link> :
        (treino.ativo || uncertain) && <button type="button" className={styles.button} disabled={busy} onClick={() => void iniciarOuVerificar()}>
          {busy ? 'Verificando sessão...' : uncertain ? 'Verificar sessão' : 'Iniciar treino'}
        </button>}
      {actionError && <p className={styles.error} role="alert">{actionError}</p>}
    </header>
    <section aria-labelledby="prescription"><h2 id="prescription">Prescrição</h2><PrescricaoList itens={exercicios} /></section>
  </main>
}
