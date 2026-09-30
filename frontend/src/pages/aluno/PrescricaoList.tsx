import EmptyState from '../../components/feedback/EmptyState'
import type { TreinoExercicioResponse } from '../../types/treinoExercicio'
import styles from './Aluno.module.css'

export type PrescricaoItem = Pick<TreinoExercicioResponse, 'id' | 'exercicioNome' | 'ordem' | 'seriesPlanejadas' | 'repeticoesPlanejadas' | 'cargaPlanejada' | 'observacoes'>

export default function PrescricaoList({ itens }: { itens: PrescricaoItem[] }) {
  if (!itens.length) return <EmptyState title="Nenhum exercício" description="Não há exercícios nesta prescrição." />
  return <ol className={styles.list}>
    {[...itens].sort((a, b) => a.ordem - b.ordem).map(item => <li className={styles.card} key={item.id}>
      <h3>{item.ordem}. {item.exercicioNome}</h3>
      <dl className={styles.metrics}>
        {item.seriesPlanejadas !== null && <div><dt>Séries</dt><dd>{item.seriesPlanejadas}</dd></div>}
        {item.repeticoesPlanejadas && <div><dt>Repetições</dt><dd>{item.repeticoesPlanejadas}</dd></div>}
        {item.cargaPlanejada !== null && <div><dt>Carga planejada</dt><dd>{new Intl.NumberFormat('pt-BR').format(item.cargaPlanejada)} kg</dd></div>}
      </dl>
      {item.observacoes && <p className={styles.text}>{item.observacoes}</p>}
    </li>)}
  </ol>
}
