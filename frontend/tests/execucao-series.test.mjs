import assert from 'node:assert/strict'
import { test } from 'node:test'
import { chromium } from 'playwright'
import { createServer } from 'vite'

test('mantém o rascunho em conflito e usa a versão recebida após recarregar e salvar', async () => {
  const server = await createServer({
    envFile: false,
    server: { host: '127.0.0.1', port: 0 },
  })
  server.config.env.VITE_API_URL = '/api'
  await server.listen()
  try {
    const browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
    })
    try {
      const page = await browser.newPage()
      await page.addInitScript(() => sessionStorage.setItem('app_treino_token', 'token-sintetico'))
      await page.route('**/api/usuarios/me', route => route.fulfill({
        json: { id: 1, nome: 'Aluno teste', email: 'aluno@example.test', tipo: 'ALUNO' },
      }))
      const exercise = {
        id: 7, formatoPrescricao: 'POR_SERIE', exercicioIdSnapshot: 8,
        exercicioNomeSnapshot: 'Supino', ordemPlanejada: 1, seriesPlanejadas: 1,
        repeticoesPlanejadas: null, cargaPlanejada: null, observacoesPrescricao: null,
        seriesPrescritasSnapshot: [{ id: 9, numeroSerie: 1, repeticoesPlanejadas: 12, cargaPlanejada: 25 }],
        versaoResultados: 0, duracaoSegundos: 60, observacoesAluno: 'teste',
        series: [{ id: 10, numeroSerie: 1, repeticoes: 9, cargaUtilizada: 22, duracaoSegundos: null, concluida: true }],
      }
      const detail = {
        id: 1, treinoId: 2, treinoNome: 'Treino teste', status: 'EM_ANDAMENTO',
        iniciadoEm: '2026-01-01T12:00:00Z', exercicios: [exercise],
      }

      let reads = 0
      let failNextRead = false
      const writes = []
      await page.route('**/api/execucoes/1', route => {
        reads++
        if (failNextRead) {
          failNextRead = false
          return route.fulfill({ status: 503, json: { erro: 'Tente novamente.' } })
        }
        return route.fulfill({ json: detail })
      })
      await page.route('**/api/execucoes/1/exercicios/7', route => {
        const request = route.request().postDataJSON()
        writes.push(request)
        if (writes.length === 1) {
          exercise.versaoResultados = 1
          exercise.series[0].repeticoes = 11
          exercise.series[0].cargaUtilizada = 26
          return route.fulfill({ status: 409, json: { erro: 'Os resultados foram alterados.' } })
        }
        exercise.versaoResultados++
        exercise.series = request.series.map((serie, index) => ({ id: 100 + index, ...serie }))
        return route.fulfill({ json: exercise })
      })

      await page.goto(new URL('/aluno/execucoes/1', server.resolvedUrls.local[0]).href)
      const reps = page.getByRole('textbox', { name: 'Repetições realizadas série 1' })
      const load = page.getByRole('textbox', { name: 'Carga utilizada série 1' })
      const save = page.getByRole('button', { name: 'Salvar séries' })
      const reload = page.getByRole('button', { name: 'Descartar rascunho e recarregar resultados' })
      await reps.fill('13')
      await load.fill('27,5')
      const initialReads = reads
      await save.click()
      await reload.waitFor()
      assert.equal(writes[0].versaoEsperada, 0)
      assert.equal(writes[0].series[0].cargaUtilizada, 27.5)
      assert.equal(await reps.inputValue(), '13')
      assert.equal(await load.inputValue(), '27,5')
      assert.equal(await save.isDisabled(), true)
      assert.equal(reads, initialReads)

      failNextRead = true
      await reload.click()
      await page.getByRole('alert').filter({ hasText: 'Tente novamente.' }).waitFor()
      assert.equal(await reps.inputValue(), '13')
      assert.equal(await load.inputValue(), '27,5')
      await reload.click()
      await page.getByText('Resultados atualizados.', { exact: true }).waitFor()
      assert.equal(await reps.inputValue(), '11')
      assert.equal(await load.inputValue(), '26')
      assert.equal(writes.length, 1)

      await reps.fill('13')
      await save.click()
      const saved = page.getByText('Séries salvas com sucesso.', { exact: true })
      await saved.waitFor()
      assert.equal(writes[1].versaoEsperada, 1)
      await reps.fill('14')
      await save.click()
      await saved.waitFor()
      assert.equal(writes[2].versaoEsperada, 2)
    } finally {
      await browser.close()
    }
  } finally {
    await server.close()
  }
})
