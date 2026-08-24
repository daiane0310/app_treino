import type {
  TreinoExercicioCreateRequest,
  TreinoExercicioResponse,
} from '../types/treinoExercicio'
import { api } from './api'

export async function getExerciciosDoTreino(
  treinoId: number,
): Promise<TreinoExercicioResponse[]> {
  const response = await api.get<TreinoExercicioResponse[]>(
    `/treinos/${treinoId}/exercicios`,
  )
  return response.data
}

export async function adicionarExercicioAoTreino(
  treinoId: number,
  request: TreinoExercicioCreateRequest,
): Promise<TreinoExercicioResponse> {
  const response = await api.post<TreinoExercicioResponse>(
    `/treinos/${treinoId}/exercicios`,
    request,
  )
  return response.data
}
