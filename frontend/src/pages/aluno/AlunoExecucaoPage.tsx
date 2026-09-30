import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ErrorState from '../../components/feedback/ErrorState'
import PageLoader from '../../components/feedback/PageLoader'
import { getExecucao } from '../../services/execucaoTreinoService'
import type { ExecucaoTreinoDetalheResponse } from '../../types/execucaoTreino'
import { alunoError, parseAlunoResourceId } from './alunoUtils'
import PrescricaoList from './PrescricaoList'
import styles from './Aluno.module.css'

export default function AlunoExecucaoPage() {
  const { execucaoId } = useParams()
  const id = parseAlunoResourceId(execucaoId)
  const [data, setData] = useState<ExecucaoTreinoDetalheResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  useEffect(() => {
    let active = true
    setData(null)
    setError(null)
    if (id !== null) getExecucao(id).then(result => { if (active) setData(result) })
      .catch((err: unknown) => { if (active) setError(alunoError(err)) })
    return () => { active = false }
  }, [id, reload])
  if (id === null) return <ErrorState message="O identificador da execução é inválido." />
  if (error) return <ErrorState message={error} onRetry={() => setReload(value => value + 1)} />
  if (!data || data.id !== id) return <PageLoader />
  const labels = { EM_ANDAMENTO: 'Em andamento', CONCLUIDO: 'Concluído', CANCELADO: 'Cancelado' }
  return <main className={styles.page}>
    <Link to={`/aluno/treinos/${data.treinoId}`}>Voltar ao treino</Link>
    <header className={styles.card}>
      <p className={styles.eyebrow}>Sessão de treino</p><h1>{data.treinoNome}</h1>
      <span className={styles.active}>{labels[data.status]}</span>
      <p>Início: <time dateTime={data.iniciadoEm}>{new Date(data.iniciadoEm).toLocaleString('pt-BR')}</time></p>
      <p>Esta tela exibe a prescrição preservada no início da sessão. O registro de séries e a finalização estarão disponíveis em uma próxima etapa.</p>
    </header>
    <section aria-labelledby="session-exercises"><h2 id="session-exercises">Exercícios da sessão</h2>
      <PrescricaoList itens={data.exercicios.map(item => ({ ...item, exercicioNome: item.exercicioNomeSnapshot, ordem: item.ordemPlanejada, observacoes: item.observacoesPrescricao }))} />
    </section>
  </main>
}
