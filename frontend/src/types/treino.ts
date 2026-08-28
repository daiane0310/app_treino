export interface TreinoResponse {
  id: number
  nome: string
  descricao: string | null
  ativo: boolean
  alunoId: number
  alunoNome: string
  personalId: number
  personalNome: string
  criadoEm: string
  atualizadoEm: string
}

export interface TreinoCreateRequest {
  nome: string
  descricao: string | null
  ativo: boolean
}

export interface TreinoUpdateRequest {
  nome: string
  descricao: string | null
  ativo: boolean
}
