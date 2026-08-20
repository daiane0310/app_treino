import type { TipoUsuario } from '../types/auth'

export function getHomePath(tipo: TipoUsuario): string {
  const paths: Record<TipoUsuario, string> = {
    ADMIN: '/admin',
    PERSONAL: '/personal',
    ALUNO: '/aluno',
  }

  return paths[tipo]
}
