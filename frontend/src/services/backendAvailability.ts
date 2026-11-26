import { apiBaseUrl } from './apiBaseUrl'

export async function isBackendAvailable(signal: AbortSignal): Promise<boolean> {
  try {
    const response = await fetch(`${apiBaseUrl}/`, {
      cache: 'no-store',
      credentials: 'omit',
      signal,
    })
    return response.status === 200 && (await response.text()).trim() === 'App Treino funcionando!'
  } catch {
    return false
  }
}
