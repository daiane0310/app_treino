export interface TreinoExercicioResponse {
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
  exercicioId: number
  ordem: number
  seriesPlanejadas: number | null
  repeticoesPlanejadas: string | null
  cargaPlanejada: number | null
  observacoes: string | null
}

export interface TreinoExercicioUpdateRequest {
  ordem: number
  seriesPlanejadas: number | null
  repeticoesPlanejadas: string | null
  cargaPlanejada: number | null
  observacoes: string | null
}

export interface TreinoExercicioOrdemItemRequest {
  treinoExercicioId: number
  ordem: number
}

export interface TreinoExercicioReordenarRequest {
  itens: TreinoExercicioOrdemItemRequest[]
}
