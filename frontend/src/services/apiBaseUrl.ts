const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()

if (!configuredApiUrl) {
  throw new Error('A variável VITE_API_URL não foi configurada')
}

export const apiBaseUrl = configuredApiUrl.replace(/\/+$/, '')
