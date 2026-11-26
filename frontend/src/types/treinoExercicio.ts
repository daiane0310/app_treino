export interface TreinoExercicioResponse {
  formatoPrescricao: 'LEGADO' | 'POR_SERIE'
  seriesPrescritas: SeriePrescritaResponse[]
  id: number
  treinoId: number
  exercicioId: number
  exercicioNome: string
  ordem: number
  seriesPlanejadas: number | null
  repeticoesPlanejadas: string | null
  cargaPlanejada: number | null
  observacoes: string | null
}

export interface TreinoExercicioCreateRequest {
  seriesPrescritas: SeriePrescritaRequest[]
  exercicioId: number
  ordem: number
  seriesPlanejadas: number | null
  repeticoesPlanejadas: string | null
  cargaPlanejada: number | null
  observacoes: string | null
}

export interface TreinoExercicioUpdateRequest {
  seriesPrescritas: SeriePrescritaRequest[]
  ordem: number
  seriesPlanejadas: number | null
  repeticoesPlanejadas: string | null
  cargaPlanejada: number | null
  observacoes: string | null
}

export interface SeriePrescritaRequest {
  numeroSerie: number
  repeticoes: number | null
  carga: number | null
}

export interface SeriePrescritaResponse extends SeriePrescritaRequest { id: number }

export interface TreinoExercicioOrdemItemRequest {
  treinoExercicioId: number
  ordem: number
}

export interface TreinoExercicioReordenarRequest {
  itens: TreinoExercicioOrdemItemRequest[]
}
