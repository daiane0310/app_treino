import { useId, useState } from 'react'
import { emptySerie, MAX_SERIES, type SerieDraft } from './seriesUtils'
import styles from './Series.module.css'

interface Props { value: SerieDraft[]; onChange: (value: SerieDraft[]) => void; disabled?: boolean }

export default function SeriesEditor({ value, onChange, disabled }: Props) {
  const id = useId()
  const [quantityError, setQuantityError] = useState<string | null>(null)
  function resize(raw: string) {
    const count = Number(raw)
    if (count > MAX_SERIES) {
      setQuantityError('O limite é de 20 séries por exercício. A quantidade anterior foi mantida.')
      return
    }
    if (!Number.isSafeInteger(count) || count < 0) return
    setQuantityError(null)
    if (count < value.length && value.slice(count).some(row => row.repeticoes.trim() || row.carga.trim()) &&
      !window.confirm('As séries excedentes têm valores preenchidos. Elas serão removidas desta prescrição ao salvar. Execuções anteriores serão preservadas. Continuar?')) return
    onChange(Array.from({ length: count }, (_, i) => value[i] ?? emptySerie()))
  }
  return <fieldset className={styles.editor} disabled={disabled}>
    <legend>Séries prescritas</legend>
    <label htmlFor={`${id}-count`}>Quantidade de séries</label>
    <input id={`${id}-count`} type="number" min="1" max={MAX_SERIES} step="1" aria-describedby={`${id}-limit`} value={value.length || ''} onChange={event => resize(event.target.value)} />
    <p id={`${id}-limit`}>Máximo de 20 séries por exercício.</p>
    {quantityError && <p role="alert">{quantityError}</p>}
    {value.length > MAX_SERIES && <p role="alert">Esta prescrição existente excede 20 séries. Nenhuma linha foi removida automaticamente; ajuste a quantidade antes de salvar.</p>}
    <p>Campos vazios significam não informado. Orientações gerais podem ficar nas observações.</p>
    {value.map((row, index) => <div className={styles.row} key={index}>
      <strong>Série {index + 1}</strong>
      <label>Repetições<input aria-label={`Repetições prescritas série ${index + 1}`} inputMode="numeric" value={row.repeticoes} onChange={event => onChange(value.map((serie, i) => i === index ? { ...serie, repeticoes: event.target.value } : serie))} /></label>
      <label>Carga (kg)<input aria-label={`Carga prescrita série ${index + 1}`} inputMode="decimal" value={row.carga} onChange={event => onChange(value.map((serie, i) => i === index ? { ...serie, carga: event.target.value } : serie))} /></label>
    </div>)}
  </fieldset>
}
