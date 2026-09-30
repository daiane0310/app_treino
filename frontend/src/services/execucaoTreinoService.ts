import { api } from './api'
import type { ExecucaoTreinoDetalheResponse, ExecucaoTreinoResponse, ExecucaoTreinoResumoResponse } from '../types/execucaoTreino'

export async function getMinhasExecucoes(): Promise<ExecucaoTreinoResumoResponse[]> {
  return (await api.get<ExecucaoTreinoResumoResponse[]>('/alunos/me/execucoes')).data
}

export async function iniciarExecucao(treinoId: number): Promise<ExecucaoTreinoResponse> {
  return (await api.post<ExecucaoTreinoResponse>(`/treinos/${treinoId}/execucoes`)).data
}

export async function getExecucao(execucaoId: number): Promise<ExecucaoTreinoDetalheResponse> {
  return (await api.get<ExecucaoTreinoDetalheResponse>(`/execucoes/${execucaoId}`)).data
}
