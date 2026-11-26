import EmptyState from '../../components/feedback/EmptyState'
import type { TreinoExercicioResponse } from '../../types/treinoExercicio'
import styles from './Aluno.module.css'

export type PrescricaoItem = Pick<TreinoExercicioResponse, 'id' | 'exercicioNome' | 'ordem' | 'seriesPlanejadas' | 'repeticoesPlanejadas' | 'cargaPlanejada' | 'observacoes' | 'seriesPrescritas' | 'formatoPrescricao'>

export default function PrescricaoList({ itens }: { itens: PrescricaoItem[] }) {
  if (!itens.length) return <EmptyState title="Nenhum exercício" description="Não há exercícios nesta prescrição." />
  return <ol className={styles.list}>
    {[...itens].sort((a, b) => a.ordem - b.ordem).map(item => <li className={styles.card} key={item.id}>
      <h3>{item.ordem}. {item.exercicioNome}</h3>
      {item.formatoPrescricao === 'POR_SERIE' && <ul>{item.seriesPrescritas.map(serie => <li key={serie.numeroSerie}>Série {serie.numeroSerie}: {serie.repeticoes ?? '—'} reps · {serie.carga === null ? 'carga não informada' : `${new Intl.NumberFormat('pt-BR').format(serie.carga)} kg`}</li>)}</ul>}
      {(item.repeticoesPlanejadas || item.cargaPlanejada !== null) && <p>Orientação legada preservada:</p>}
      <dl className={styles.metrics}>
        {item.seriesPlanejadas !== null && <div><dt>Séries</dt><dd>{item.seriesPlanejadas}</dd></div>}
        {item.repeticoesPlanejadas && <div><dt>Repetições</dt><dd>{item.repeticoesPlanejadas}</dd></div>}
        {item.cargaPlanejada !== null && <div><dt>Carga planejada</dt><dd>{new Intl.NumberFormat('pt-BR').format(item.cargaPlanejada)} kg</dd></div>}
      </dl>
      {item.observacoes && <p className={styles.text}>{item.observacoes}</p>}
    </li>)}
  </ol>
}
