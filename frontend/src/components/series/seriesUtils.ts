import type { SeriePrescritaRequest, TreinoExercicioResponse } from '../../types/treinoExercicio'

export interface SerieDraft { repeticoes: string; carga: string }
export const MAX_SERIES = 20
export const emptySerie = (): SerieDraft => ({ repeticoes: '', carga: '' })

export function parseRepeticoes(value: string): number | null {
  if (!value.trim()) return null
  if (!/^\d+$/.test(value.trim()) || Number(value) > 2147483647) throw new Error('Repetições devem ser um inteiro entre 0 e 2147483647.')
  return Number(value)
}

export function parseCarga(value: string): number | null {
  if (!value.trim()) return null
  const normalized = value.trim().replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized) || Number(normalized) > 99999999.99) throw new Error('Carga deve estar entre 0 e 99999999,99, com até duas casas decimais.')
  return Number(normalized)
}

export function seriesRequest(drafts: SerieDraft[]): SeriePrescritaRequest[] {
  if (drafts.length > MAX_SERIES) throw new Error('O limite é de 20 séries por exercício.')
  if (!drafts.length) throw new Error('Informe pelo menos uma série.')
  return drafts.map((serie, i) => ({ numeroSerie: i + 1, repeticoes: parseRepeticoes(serie.repeticoes), carga: parseCarga(serie.carga) }))
}

export function prescriptionDrafts(item: TreinoExercicioResponse): SerieDraft[] {
  if (item.formatoPrescricao === 'POR_SERIE') return item.seriesPrescritas.map(serie => ({ repeticoes: serie.repeticoes?.toString() ?? '', carga: serie.carga?.toString() ?? '' }))
  // Legacy repetitions remain visible as guidance, never guessed from a range.
  return Array.from({ length: Math.max(0, item.seriesPlanejadas ?? 0) }, () => ({ repeticoes: '', carga: item.cargaPlanejada !== null && item.cargaPlanejada >= 0 ? String(item.cargaPlanejada) : '' }))
}
