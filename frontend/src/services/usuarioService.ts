import type { UsuarioMeResponse } from '../types/auth'
import { api } from './api'

export async function getMe(): Promise<UsuarioMeResponse> {
  const response = await api.get<UsuarioMeResponse>('/usuarios/me')
  return response.data
}
