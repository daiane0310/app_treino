import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    const { VITE_API_URL } = loadEnv(mode, process.cwd())
    let apiUrl: URL
    try {
      apiUrl = new URL(VITE_API_URL?.trim())
    } catch {
      throw new Error('Configure VITE_API_URL com uma URL HTTP(S) absoluta antes do build.')
    }
    if (!['http:', 'https:'].includes(apiUrl.protocol) || apiUrl.username || apiUrl.password
        || apiUrl.search || apiUrl.hash) {
      throw new Error('VITE_API_URL deve usar HTTP(S) e não pode conter credenciais, query ou fragmento.')
    }
  }

  return { plugins: [react()] }
})
