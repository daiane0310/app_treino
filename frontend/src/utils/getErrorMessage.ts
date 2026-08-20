import axios from 'axios'
import type { ApiError } from '../types/api'

const NETWORK_ERROR_MESSAGE = 'Não foi possível conectar ao servidor.'
const UNEXPECTED_ERROR_MESSAGE = 'Ocorreu um erro inesperado.'

export function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiError>(error)) {
    return UNEXPECTED_ERROR_MESSAGE
  }

  if (!error.response) {
    return NETWORK_ERROR_MESSAGE
  }

  const backendMessage = error.response.data?.erro
  return typeof backendMessage === 'string' && backendMessage.trim()
    ? backendMessage
    : UNEXPECTED_ERROR_MESSAGE
}
