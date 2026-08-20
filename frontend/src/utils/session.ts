export const TOKEN_STORAGE_KEY = 'app_treino_token'
export const SESSION_EXPIRED_EVENT = 'app-treino:session-expired'

export function getStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_STORAGE_KEY)
}

export function storeToken(token: string): void {
  sessionStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function removeStoredToken(): void {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY)
}

export function emitSessionExpired(): void {
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
}
