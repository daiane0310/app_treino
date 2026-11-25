# Primeira publicação do App Treino

Backend Spring Boot no Render, frontend Vite na Vercel e o banco existente no Neon. A publicação inicial é manual. O cadastro fica restrito a usuários autenticados com perfil ADMIN. O login permanece disponível para as contas existentes.

## Preparação sem publicar

1. No Neon, confirme a branch, o banco e o backup `backup-antes-v3-v4`. Em uma consulta somente leitura, verifique `flyway_schema_history`, incluindo versão, tipo, checksum e sucesso. Confirme que a V2 é a última migração aplicada e que o histórico é compatível com a configuração do Flyway.
2. Revise as contas privilegiadas já existentes. O novo controle protege novos cadastros, mas não revoga contas ou privilégios concedidos anteriormente. Confirme que há pelo menos um ADMIN legítimo com acesso. Se faltar um administrador, faça a recuperação por um procedimento autorizado no banco, com BCrypt e preservação das contas existentes. Não reabra o cadastro público.
3. Prepare os valores de ambiente nos gerenciadores das plataformas. Não inclua o banco em nenhum Blueprint, configuração de prévia ou serviço de teste. No Render, criar/sincronizar o serviço pode disparar o primeiro deploy mesmo com deploy automático desativado. Na Vercel, importar um repositório também pode iniciar um deploy. Aguarde autorização antes de qualquer ação que inicie a publicação.

## Render

Após autorização, crie um Web Service Docker apontando para a raiz do repositório e a branch `main` já aprovada. Use o `Dockerfile` da raiz, health check `/`, porta interna `10000` e Auto-Deploy em **Off**. O `render.yaml` descreve a mesma configuração para provisionamento via Blueprint. Escolha no painel o plano e a região adequados. O Blueprint declara somente o backend.

| Variável | Onde definir e valor |
| --- | --- |
| `DB_URL` | Ambiente do Render. JDBC do Neon existente, no formato `jdbc:postgresql://<host>/<banco>?sslmode=require`. Preserve os demais parâmetros TLS aplicáveis da conexão do Neon. |
| `DB_USERNAME`, `DB_PASSWORD` | Ambiente do Render. Usuário e senha do Neon. O papel usado pelo Flyway deve ter as permissões exigidas para migrar o schema existente. |
| `JWT_SECRET` | Ambiente do Render. Gere um segredo novo de produção, por exemplo com `openssl rand -base64 48`, e guarde-o no painel. Rotacioná-lo invalida sessões existentes. |
| `APP_CORS_ALLOWED_ORIGINS` | Ambiente do Render. Use a origem HTTPS exata do frontend de produção, sem barra final. Para mais de uma origem, separe por vírgulas. |
| `SERVER_PORT` | Ambiente do Render. Defina `10000` se criar o serviço manualmente. |

O backend executa Flyway ao iniciar. A primeira inicialização com acesso ao Neon aplica V3 e V4 se a produção estiver em V2. Use a janela aprovada, acompanhe o log e confirme as versões aplicadas antes de liberar o frontend. Em caso de falha, interrompa a publicação e revise o histórico e o erro antes de qualquer tentativa de recuperação ou reexecução.

## Vercel

Após autorização, configure **Root Directory** como `frontend`, preset **Vite**, build `npm run build` e saída `dist`. Use um domínio de produção estável e defina `VITE_API_URL` para a URL HTTPS do Render no ambiente **Production** antes do build. O valor é público no JavaScript compilado. Credenciais do banco e segredo JWT pertencem somente ao Render.

O `frontend/vercel.json` habilita rotas diretas da SPA e desativa os deploys automáticos do Git. Vincule o projeto e execute o deploy manual de produção pelo Vercel CLI (`vercel --prod`), usando o checkout do commit aprovado e o Root Directory configurado. Evite conectar prévias ao backend de produção. Se for necessário privar também a tela de login e os arquivos estáticos, ative **Deployment Protection** para produção conforme a disponibilidade no plano da Vercel. O acesso aos dados da API é controlado pela autenticação do aplicativo.

## Verificação após autorização e deploy

- Confirme V3 e V4 no histórico do Flyway e o health check do Render.
- Abra a tela de login e uma rota interna por link direto. Valide o login com contas existentes, o cadastro restrito a ADMIN e o salvamento de resultados com a versão esperada.
- Libere backend e frontend na mesma janela. Clientes antigos sem `versaoEsperada` ou sem a nova lista de séries prescritas podem receber HTTP 400.
