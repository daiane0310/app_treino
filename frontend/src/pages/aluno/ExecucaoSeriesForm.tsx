import { useRef, useState } from 'react'
import { parseCarga, parseRepeticoes } from '../../components/series/seriesUtils'
import { salvarSeries } from '../../services/execucaoTreinoService'
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

export default function ExecucaoSeriesForm({ item, execucaoId, editable }: { item: ExecucaoExercicioResponse; execucaoId: number; editable: boolean }) {
  const [rows, setRows] = useState(() => initialRows(item))
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const locked = useRef(false)
  async function save() {
    if (locked.current || !editable) return
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
        duracaoSegundos: item.duracaoSegundos,
        observacoesAluno: item.observacoesAluno,
        series,
      })
      setRows(initialRows(result))
      setMessage('Séries salvas com sucesso.')
    } catch (err: unknown) {
      setError(err instanceof Error && !('isAxiosError' in err) ? err.message : alunoError(err))
    } finally { locked.current = false; setBusy(false) }
  }
  return <article className={styles.card}>
    <h3>{item.ordemPlanejada}. {item.exercicioNomeSnapshot}</h3>
    {item.observacoesPrescricao && <p className={styles.text}>{item.observacoesPrescricao}</p>}
    {(item.formatoPrescricao === 'LEGADO' || item.repeticoesPlanejadas || item.cargaPlanejada !== null) && <p>Orientação legada preservada: {item.seriesPlanejadas ?? 'quantidade não informada'} séries; {item.repeticoesPlanejadas ?? 'repetições não informadas'}; carga geral {item.cargaPlanejada === null ? 'não informada' : `${item.cargaPlanejada} kg`}. Faixas de repetições não foram convertidas.</p>}
    <form onSubmit={event => { event.preventDefault(); void save() }}>
      <fieldset className={seriesStyles.editor} disabled={busy || !editable}>
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
        {editable && item.formatoPrescricao === 'LEGADO' && <button type="button" className={styles.secondary} onClick={() => setRows([...rows, { numeroSerie: Math.max(0, ...rows.map(row => row.numeroSerie)) + 1, repeticoes: '', carga: '' }])}>Adicionar série realizada</button>}
        {editable && <button className={styles.button} disabled={!rows.length} type="submit">{busy ? 'Salvando...' : 'Salvar séries'}</button>}
      </fieldset>
    </form>
    {message && <p role="status">{message}</p>}
    {error && <p className={styles.error} role="alert">{error}</p>}
  </article>
}
