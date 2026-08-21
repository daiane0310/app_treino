import type { TreinoResponse } from '../types/treino'
import { api } from './api'

export async function getTreinosDoAluno(
  alunoId: number,
): Promise<TreinoResponse[]> {
  const response = await api.get<TreinoResponse[]>(`/alunos/${alunoId}/treinos`)
  return response.data
}

export async function getTreinoPorId(treinoId: number): Promise<TreinoResponse> {
  const response = await api.get<TreinoResponse>(`/treinos/${treinoId}`)
  return response.data
}
