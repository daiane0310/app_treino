import type { AlunoResumoResponse } from '../types/aluno'
import { api } from './api'

export async function getMeusAlunos(): Promise<AlunoResumoResponse[]> {
  const response = await api.get<AlunoResumoResponse[]>('/personais/me/alunos')
  return response.data
}
