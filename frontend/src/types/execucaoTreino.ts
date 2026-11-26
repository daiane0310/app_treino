export type StatusExecucaoTreino = 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'

export interface ExecucaoTreinoResumoResponse {
  id: number
  treinoId: number
  treinoNome: string
  status: StatusExecucaoTreino
  iniciadoEm: string
  finalizadoEm: string | null
  duracaoSegundos: number | null
}

export interface ExecucaoTreinoResponse extends ExecucaoTreinoResumoResponse {
  observacoes: string | null
}

export interface ExecucaoSerieResponse {
  id: number
  numeroSerie: number
  repeticoes: number | null
  cargaUtilizada: number | null
  duracaoSegundos: number | null
  concluida: boolean
}

export interface ExecucaoExercicioResponse {
  versaoResultados: number
  formatoPrescricao: 'LEGADO' | 'POR_SERIE'
  seriesPrescritasSnapshot: SeriePrescritaSnapshotResponse[]
  id: number
  exercicioIdSnapshot: number
  exercicioNomeSnapshot: string
  ordemPlanejada: number
  seriesPlanejadas: number | null
  repeticoesPlanejadas: string | null
  cargaPlanejada: number | null
  observacoesPrescricao: string | null
  duracaoSegundos: number | null
  observacoesAluno: string | null
  series: ExecucaoSerieResponse[]
}

export interface SeriePrescritaSnapshotResponse {
  id: number
  numeroSerie: number
  repeticoesPlanejadas: number | null
  cargaPlanejada: number | null
}

export interface RegistrarExecucaoExercicioRequest {
  versaoEsperada: number
  duracaoSegundos: number | null
  observacoesAluno: string | null
  series: Omit<ExecucaoSerieResponse, 'id'>[]
}

export interface ExecucaoTreinoDetalheResponse extends ExecucaoTreinoResponse {
  exercicios: ExecucaoExercicioResponse[]
}
