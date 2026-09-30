import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/feedback/EmptyState'
import ErrorState from '../../components/feedback/ErrorState'
import PageLoader from '../../components/feedback/PageLoader'
import { getMeusTreinos } from '../../services/treinoService'
import type { TreinoResponse } from '../../types/treino'
import { alunoError } from './alunoUtils'
import styles from './Aluno.module.css'

export default function AlunoTreinosPage() {
  const [treinos, setTreinos] = useState<TreinoResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  useEffect(() => {
    let active = true
    setTreinos(null)
    setError(null)
    getMeusTreinos().then(data => { if (active) setTreinos(data) })
      .catch((err: unknown) => { if (active) setError(alunoError(err)) })
    return () => { active = false }
  }, [reload])
  if (error) return <ErrorState message={error} onRetry={() => setReload(value => value + 1)} />
  if (!treinos) return <PageLoader />
  return <main className={styles.page}>
    <header><p className={styles.eyebrow}>Área do aluno</p><h1>Meus treinos</h1><p>Consulte sua prescrição e continue seu treino.</p></header>
    {!treinos.length ? <EmptyState title="Nenhum treino disponível" description="Seus treinos aparecerão aqui quando forem cadastrados pelo personal." /> :
      <ul className={styles.grid}>{treinos.map(treino => <li className={styles.card} key={treino.id}>
        <span className={treino.ativo ? styles.active : styles.inactive}>{treino.ativo ? 'Ativo' : 'Inativo'}</span>
        <h2>{treino.nome}</h2>
        {treino.descricao && <p className={styles.text}>{treino.descricao}</p>}
        <Link className={styles.button} to={`/aluno/treinos/${treino.id}`} aria-label={`Abrir treino ${treino.nome}`}>Abrir treino</Link>
      </li>)}</ul>}
  </main>
}
