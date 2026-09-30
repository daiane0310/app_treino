import axios from 'axios'
import { getErrorMessage } from '../../utils/getErrorMessage'

export function parseAlunoResourceId(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) return null
  const id = Number(value)
  return Number.isSafeInteger(id) ? id : null
}

export function alunoError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 403) return 'Você não tem permissão para acessar este recurso.'
    if (error.response?.status === 404) return 'O treino ou a execução não foi encontrado.'
  }
  return getErrorMessage(error)
}
