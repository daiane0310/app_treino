import type { TreinoExercicioResponse } from '../types/treinoExercicio'
import { api } from './api'

export async function getExerciciosDoTreino(
  treinoId: number,
): Promise<TreinoExercicioResponse[]> {
  const response = await api.get<TreinoExercicioResponse[]>(
    `/treinos/${treinoId}/exercicios`,
  )
  return response.data
}
