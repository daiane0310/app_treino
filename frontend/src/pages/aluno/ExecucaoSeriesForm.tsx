import { isAxiosError } from 'axios'
import { useRef, useState } from 'react'
import { parseCarga, parseRepeticoes } from '../../components/series/seriesUtils'
import { getExecucao, salvarSeries } from '../../services/execucaoTreinoService'
import type { ExecucaoExercicioResponse, ExecucaoSerieResponse } from '../../types/execucaoTreino'
import { alunoError } from './alunoUtils'
import styles from './Aluno.module.css'
import seriesStyles from '../../components/series/Series.module.css'

interface Row { numeroSerie: number; repeticoes: string; carga: string; original?: ExecucaoSerieResponse }
function initialRows(item: ExecucaoExercicioResponse): Row[] {
  const numbers = new Set(item.seriesPrescritasSnapshot.map(serie => serie.numeroSerie))
  if (item.formatoPrescricao === 'LEGADO' && !numbers.size && item.seriesPlanejadas !== null) {
    for (let i = 1; i <= item.seriesPlanejadas; i++) numbers.add(i)
  }
  item.series.forEach(serie => numbers.add(serie.numeroSerie))
  return [...numbers].sort((a, b) => a - b).map(numeroSerie => {
    const original = item.series.find(serie => serie.numeroSerie === numeroSerie)
    return { numeroSerie, repeticoes: original?.repeticoes?.toString() ?? '', carga: original?.cargaUtilizada?.toString() ?? '', original }
  })
}

export default function ExecucaoSeriesForm({ item: initialItem, execucaoId, editable }: { item: ExecucaoExercicioResponse; execucaoId: number; editable: boolean }) {
  const [item, setItem] = useState(initialItem)
  const [conflict, setConflict] = useState(false)
  const [sessionClosed, setSessionClosed] = useState(false)
  const canEdit = editable && !sessionClosed
  const [rows, setRows] = useState(() => initialRows(item))
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const locked = useRef(false)
  async function save() {
    if (locked.current || !canEdit || conflict) return
    locked.current = true
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const series = rows.map(row => ({
        numeroSerie: row.numeroSerie,
        repeticoes: parseRepeticoes(row.repeticoes),
        cargaUtilizada: parseCarga(row.carga),
        duracaoSegundos: row.original?.duracaoSegundos ?? null,
        concluida: row.original?.concluida ?? false,
      }))
      const result = await salvarSeries(execucaoId, item.id, {
        versaoEsperada: item.versaoResultados,
        duracaoSegundos: item.duracaoSegundos,
        observacoesAluno: item.observacoesAluno,
        series,
      })
      setItem(result)
      setRows(initialRows(result))
      setMessage('Séries salvas com sucesso.')
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setConflict(true)
      }
      setError(err instanceof Error && !isAxiosError(err) ? err.message : alunoError(err))
    } finally { locked.current = false; setBusy(false) }
  }
  async function reloadResults() {
    if (locked.current) return
    locked.current = true
    setBusy(true)
    setError(null)
    try {
      const execution = await getExecucao(execucaoId)
      const latest = execution.exercicios.find(exercise => exercise.id === item.id)
      if (!latest) throw new Error('O exercício não foi encontrado nesta execução.')
      setItem(latest)
      setRows(initialRows(latest))
      setSessionClosed(execution.status !== 'EM_ANDAMENTO')
      setConflict(false)
      setMessage(execution.status === 'EM_ANDAMENTO'
        ? 'Resultados atualizados.'
        : 'Resultados atualizados. A execução foi encerrada.')
    } catch (err: unknown) {
      setError(err instanceof Error && !isAxiosError(err) ? err.message : alunoError(err))
    } finally {
      locked.current = false
      setBusy(false)
    }
  }

  return <article className={styles.card}>
    <h3>{item.ordemPlanejada}. {item.exercicioNomeSnapshot}</h3>
    {item.observacoesPrescricao && <p className={styles.text}>{item.observacoesPrescricao}</p>}
    {(item.formatoPrescricao === 'LEGADO' || item.repeticoesPlanejadas || item.cargaPlanejada !== null) && <p>Orientação legada preservada: {item.seriesPlanejadas ?? 'quantidade não informada'} séries; {item.repeticoesPlanejadas ?? 'repetições não informadas'}; carga geral {item.cargaPlanejada === null ? 'não informada' : `${item.cargaPlanejada} kg`}. Faixas de repetições não foram convertidas.</p>}
    <form onSubmit={event => { event.preventDefault(); void save() }}>
      <fieldset className={seriesStyles.editor} disabled={busy || !canEdit}>
        <legend>Prescrito e realizado</legend>
        {rows.map((row, index) => {
          const planned = item.seriesPrescritasSnapshot.find(serie => serie.numeroSerie === row.numeroSerie)
          return <div className={seriesStyles.row} key={row.numeroSerie}>
            <strong>Série {row.numeroSerie}</strong>
            <p className={seriesStyles.reference}>Prescrito: {planned?.repeticoesPlanejadas ?? 'não informado'} reps | {planned?.cargaPlanejada == null ? 'carga não informada' : `${planned.cargaPlanejada.toLocaleString('pt-BR')} kg`}</p>
            <label>Repetições realizadas<input aria-label={`Repetições realizadas série ${row.numeroSerie}`} inputMode="numeric" value={row.repeticoes} onChange={event => setRows(rows.map((r, i) => i === index ? { ...r, repeticoes: event.target.value } : r))} /></label>
            <label>Carga utilizada (kg)<input aria-label={`Carga utilizada série ${row.numeroSerie}`} inputMode="decimal" value={row.carga} onChange={event => setRows(rows.map((r, i) => i === index ? { ...r, carga: event.target.value } : r))} /></label>
          </div>
        })}
        {!rows.length && <p>A quantidade de séries não foi informada neste snapshot legado. Adicione as séries que realizou.</p>}
        {canEdit && item.formatoPrescricao === 'LEGADO' && <button type="button" className={styles.secondary} onClick={() => setRows([...rows, { numeroSerie: Math.max(0, ...rows.map(row => row.numeroSerie)) + 1, repeticoes: '', carga: '' }])}>Adicionar série realizada</button>}
        {canEdit && <button className={styles.button} disabled={!rows.length || conflict} type="submit">{busy ? 'Salvando...' : 'Salvar séries'}</button>}
      </fieldset>
    </form>
    {message && <p role="status">{message}</p>}
    {conflict && <div role="status">
      <p>O salvamento entrou em conflito com o estado atual da execução. Seus valores digitados foram mantidos. Copie o que quiser reaproveitar antes de recarregar.</p>
      <button className={styles.secondary} disabled={busy} type="button" onClick={() => void reloadResults()}>
        Descartar rascunho e recarregar resultados
      </button>
    </div>}
    {error && <p className={styles.error} role="alert">{error}</p>}
  </article>
}
