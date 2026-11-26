import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { chromium } from 'playwright'
import { createServer } from 'vite'

const backendMarker = 'App Treino funcionando!'
const credentials = { email: 'aluno@example.test', senha: 'senha-de-teste' }
const healthPath = '**/api/'
const loginPath = '**/api/auth/login'
let server
let browser
let loginUrl

before(async () => {
  server = await createServer({ envFile: false, server: { host: '127.0.0.1', port: 0 } })
  server.config.env.VITE_API_URL = '/api'
  await server.listen()
  loginUrl = new URL('/login', server.resolvedUrls.local[0]).href
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
  })
})

after(async () => {
  await browser?.close()
  await server?.close()
})

async function openPage(t) {
  const page = await browser.newPage()
  t.after(() => page.close())
  page.setDefaultTimeout(5_000)
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
  return page
}

async function openLogin(page) {
  await page.goto(loginUrl)
  await page.locator('#email').waitFor()
  await page.clock.runFor(10)
}

async function fillLogin(page) {
  await page.getByLabel('E-mail', { exact: true }).fill(credentials.email)
  await page.getByLabel('Senha', { exact: true }).fill(credentials.senha)
}

function submit(page) {
  return page.getByRole('button', { name: 'Entrar', exact: true })
}

function retry(page) {
  return page.getByRole('button', { name: 'Tentar novamente' })
}

test('habilita login rapidamente, envia apenas uma autenticação e mantém o redirecionamento', async t => {
  const page = await openPage(t)
  const checks = []
  await page.route(healthPath, async route => {
    checks.push(route.request().headers())
    await route.fulfill({ body: backendMarker })
  })
  await page.route('**/api/alunos/me/**', route => route.fulfill({ json: [] }))
  let logins = 0
  let body
  await page.route(loginPath, async route => {
    logins++
    body = route.request().postDataJSON()
    await route.fulfill({
      json: { email: credentials.email, id: 1, nome: 'Aluno teste', tipo: 'ALUNO', token: 'token-sintetico' },
    })
  })

  await openLogin(page)
  await fillLogin(page)
  await page.locator('button[type=submit]:enabled').waitFor()
  assert.equal(await page.getByRole('status').count(), 0)
  await page.locator('form').evaluate(form => {
    form.requestSubmit()
    form.requestSubmit()
  })
  await page.waitForURL('**/aluno')
  assert.equal(logins, 1)
  assert.deepEqual(body, credentials)
  assert.equal(checks.length, 1)
  assert.equal(checks[0].authorization, undefined)
  assert.equal(checks[0].cookie, undefined)
})

test('rejeita resposta intermediária e preserva os campos enquanto aguarda nova verificação', async t => {
  const page = await openPage(t)
  let checks = 0
  let logins = 0
  await page.route(healthPath, route =>
    route.fulfill({ body: ++checks === 1 ? '<html>Inicializando</html>' : backendMarker }))
  await page.route(loginPath, route => {
    logins++
    return route.abort()
  })

  const firstCheck = page.waitForResponse('**/api/')
  await openLogin(page)
  await firstCheck
  await fillLogin(page)
  await page.locator('#senha').press('Enter')
  assert.equal(await submit(page).isDisabled(), true)
  await page.clock.runFor(1_500)
  await page.getByText(/Estamos iniciando o servidor/).waitFor()
  assert.equal(checks, 1)
  const secondCheck = page.waitForResponse('**/api/')
  await page.clock.runFor(5_000)
  await secondCheck
  await page.locator('button[type=submit]:enabled').waitFor()
  assert.equal(await page.locator('#email').inputValue(), credentials.email)
  assert.equal(await page.locator('#senha').inputValue(), credentials.senha)
  assert.equal(await page.getByRole('status').count(), 0)
  await page.clock.fastForward(90_000)
  assert.equal(checks, 2)
  assert.equal(logins, 0)
})

test('cancela a chamada travada, encerra o ciclo no prazo e reinicia apenas sob solicitação', { timeout: 15_000 }, async t => {
  const page = await openPage(t)
  let checks = 0
  let ready = false
  const secondCheckStarted = Promise.withResolvers()
  await page.route(healthPath, async route => {
    checks++
    if (checks === 2) secondCheckStarted.resolve()
    if (ready) await route.fulfill({ body: backendMarker })
    // Deliberately leave the other requests unresolved.
  })

  const first = page.waitForRequest('**/api/')
  await openLogin(page)
  await first
  await fillLogin(page)
  const cancelled = page.waitForEvent('requestfailed', request => request.url().endsWith('/api/'))
  await page.clock.runFor(8_000)
  await cancelled
  assert.equal(checks, 1)
  await page.clock.runFor(5_001)
  await secondCheckStarted.promise
  assert.equal(checks, 2)
  await page.clock.fastForward(90_000)
  await retry(page).waitFor()
  await page.getByRole('status').filter({ hasText: 'O servidor não respondeu a tempo' }).waitFor()
  const countAtDeadline = checks
  await page.clock.fastForward(90_000)
  assert.equal(checks, countAtDeadline)
  assert.equal(await page.locator('#senha').inputValue(), credentials.senha)

  ready = true
  await retry(page).evaluate(button => {
    button.click()
    button.click()
  })
  const retried = page.waitForResponse('**/api/')
  await page.clock.runFor(10)
  await retried
  await page.locator('button[type=submit]:enabled').waitFor()
  assert.equal(checks, countAtDeadline + 1)
})

test('cancela a verificação ao desmontar a tela sem recarregar o documento', async t => {
  const page = await openPage(t)
  let checks = 0
  await page.route(healthPath, () => { checks++ })

  const first = page.waitForRequest('**/api/')
  await openLogin(page)
  await first
  const cancelled = page.waitForEvent('requestfailed', request => request.url().endsWith('/api/'))
  await page.evaluate(() => {
    history.pushState(null, '', '/403')
    window.dispatchEvent(new PopStateEvent('popstate'))
  })
  await page.locator('#email').waitFor({ state: 'detached' })
  await cancelled
  await page.clock.fastForward(100_000)
  assert.equal(checks, 1)
})

test('distingue senha inválida de indisponibilidade e nunca reenvia a senha na nova verificação', async t => {
  const page = await openPage(t)
  await page.route(healthPath, route => route.fulfill({ body: backendMarker }))
  let logins = 0
  await page.route(loginPath, route => {
    logins++
    if (logins === 1) return route.fulfill({ status: 401, json: { erro: 'Credenciais inválidas' } })
    return route.abort('failed')
  })
  await openLogin(page)
  await fillLogin(page)
  await submit(page).click()
  await page.getByRole('alert').filter({ hasText: 'E-mail ou senha inválidos.' }).waitFor()
  assert.equal(await submit(page).isEnabled(), true)
  assert.equal(await retry(page).count(), 0)

  await submit(page).click()
  await page.getByRole('status').filter({ hasText: 'A conexão com o servidor foi interrompida durante o login.' }).waitFor()
  assert.equal(await submit(page).isDisabled(), true)
  await page.locator('#senha').press('Enter')
  assert.equal(logins, 2)
  assert.equal(await page.getByRole('alert').count(), 0)
  assert.equal(await page.locator('#email').getAttribute('aria-invalid'), 'false')
  assert.equal(await page.locator('#senha').inputValue(), credentials.senha)
  await retry(page).click()
  const retried = page.waitForResponse('**/api/')
  await page.clock.runFor(10)
  await retried
  await page.locator('button[type=submit]:enabled').waitFor()
  assert.equal(logins, 2)
})

test('após HTTP 503, cliques sucessivos em tentar novamente iniciam somente um GET', async t => {
  const page = await openPage(t)
  let checks = 0
  let logins = 0
  await page.route(healthPath, route => {
    checks++
    return route.fulfill({ body: backendMarker })
  })
  await page.route(loginPath, route => {
    logins++
    return route.fulfill({ status: 503 })
  })

  await openLogin(page)
  await fillLogin(page)
  await submit(page).click()
  await page.getByRole('status').filter({ hasText: 'A conexão com o servidor foi interrompida' }).waitFor()
  const retried = page.waitForResponse('**/api/')
  await retry(page).evaluate(button => {
    button.click()
    button.click()
    button.form.requestSubmit()
  })
  await page.clock.runFor(10)
  await retried
  await page.locator('button[type=submit]:enabled').waitFor()
  await page.clock.fastForward(100_000)
  assert.equal(checks, 2)
  assert.equal(logins, 1)
  assert.equal(await page.locator('#email').inputValue(), credentials.email)
  assert.equal(await page.locator('#senha').inputValue(), credentials.senha)
  assert.equal(await page.getByRole('status').count(), 0)
})

test('sair da tela durante o POST cancela a autenticação pendente', { timeout: 15_000 }, async t => {
  const page = await openPage(t)
  await page.route(healthPath, route => route.fulfill({ body: backendMarker }))
  const started = Promise.withResolvers()
  await page.route(loginPath, route => started.resolve(route))
  await openLogin(page)
  await fillLogin(page)
  await submit(page).click()
  const pending = await started.promise

  const cancelled = page.waitForEvent('requestfailed', request => request.url().endsWith('/api/auth/login'))
  await page.evaluate(() => {
    history.pushState(null, '', '/403')
    window.dispatchEvent(new PopStateEvent('popstate'))
  })
  await page.locator('#email').waitFor({ state: 'detached' })
  await cancelled
  await pending.fulfill({
    json: { email: credentials.email, id: 1, nome: 'Aluno teste', tipo: 'ALUNO', token: 'token-sintetico' },
  })
  assert.equal(await page.evaluate(() => sessionStorage.getItem('app_treino_token')), null)
  assert.match(page.url(), /\/403$/)
})
