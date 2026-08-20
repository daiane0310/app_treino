export type TipoUsuario = 'ADMIN' | 'PERSONAL' | 'ALUNO'

export interface LoginRequest {
  email: string
  senha: string
}

export interface LoginResponse {
  id: number
  nome: string
  email: string
  tipo: TipoUsuario
  token: string
}

export interface UsuarioMeResponse {
  id: number
  nome: string
  email: string
  tipo: TipoUsuario
}
