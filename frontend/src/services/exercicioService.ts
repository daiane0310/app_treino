import type { ExercicioResponse } from '../types/exercicio'
import { api } from './api'

export async function getExerciciosAtivos(): Promise<ExercicioResponse[]> {
  const response = await api.get<ExercicioResponse[]>('/exercicios')
  return response.data
}
