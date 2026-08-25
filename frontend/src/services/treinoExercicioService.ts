import type {
  TreinoExercicioCreateRequest,
  TreinoExercicioResponse,
  TreinoExercicioUpdateRequest,
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

export async function atualizarExercicioDoTreino(
  treinoId: number,
  treinoExercicioId: number,
  request: TreinoExercicioUpdateRequest,
): Promise<TreinoExercicioResponse> {
  const response = await api.put<TreinoExercicioResponse>(
    `/treinos/${treinoId}/exercicios/${treinoExercicioId}`,
    request,
  )
  return response.data
}

export async function removerExercicioDoTreino(
  treinoId: number,
  treinoExercicioId: number,
): Promise<void> {
  await api.delete<void>(
    `/treinos/${treinoId}/exercicios/${treinoExercicioId}`,
  )
}
