# Séries individualizadas

## Persistência e implantação

A V3 é aditiva: cria `series_prescritas` e `execucoes_series_prescritas`, com chaves estrangeiras, unicidade do número por exercício, números positivos e valores não negativos. Acrescenta `formato_prescricao` (`LEGADO`/`POR_SERIE`) às prescrições e aos exercícios de execução. Não altera V1/V2, não reescreve resultados e não executa backfill em históricos.

A migration foi preparada, não aplicada no Neon. Deve ser aplicada pelo Flyway no fluxo normal, antes de usar o novo backend/frontend. A aplicação não foi iniciada contra o banco durante esta implementação. Testes unitários usam objetos/mocks; o teste de navegador usa API simulada. Validar a migration em uma cópia isolada com dados legados antes da implantação real.

## Contratos

O limite operacional é de **20 séries por exercício**. O backend rejeita listas maiores e também atualizações legadas sem lista que informem quantidade maior que 20, mantendo a exigência de numeração contínua de 1 a N. O PERSONAL bloqueia a geração acima de 20, informa o limite e mantém as linhas anteriores. O envio também valida esse limite.

O limite não modifica registros existentes, não corta linhas automaticamente e não altera snapshots nem resultados. Uma prescrição existente acima do limite continua legível; para salvar uma edição, a quantidade precisa ser ajustada explicitamente. A V3 não foi modificada por este limite.

POST/PUT de prescrição recebem `seriesPrescritas: [{numeroSerie, repeticoes, carga}]`. Novas prescrições exigem uma lista não vazia, ordenada e contínua de 1 a N. Repetições são inteiros não negativos; carga vai de 0 a 99999999,99, com até duas casas decimais. Ambos aceitam null. A quantidade é derivada da lista. Os campos gerais permanecem para compatibilidade, mas não definem uma prescrição POR_SERIE.

GET da prescrição inclui `formatoPrescricao` e `seriesPrescritas`. Uma atualização sem a lista ainda pode editar uma prescrição LEGADO, mas é rejeitada para POR_SERIE, evitando perda silenciosa por clientes antigos. POST antigo sem lista é rejeitado: publicar os clientes de escrita atualizados em conjunto.

GET de execução inclui, em cada exercício, `formatoPrescricao`, `seriesPrescritasSnapshot` (campos `numeroSerie`, `repeticoesPlanejadas`, `cargaPlanejada`) e `series` (resultados existentes). Resultados não são preenchidos automaticamente a partir da prescrição.

PUT de resultados permanece substituição completa por exercício. A interface envia todas as linhas e preserva duração, observações e indicador de conclusão já existentes. A tela atual não oferece finalização do treino nem conclusão individual de séries; novos registros mantêm `concluida=false`. Cargas/repetições nulas não são transformadas em zero. Séries extras antigas continuam representadas e são reenviadas.

## Legado

As linhas existentes recebem formato LEGADO. Não há inferência de uma faixa textual: nem mesmo texto numérico é convertido automaticamente nesta versão. A orientação geral permanece armazenada e visível.

Ao editar no PERSONAL, uma quantidade conhecida gera linhas com repetições vazias e carga geral válida como base. O salvamento explícito converte a prescrição para POR_SERIE, mantendo o texto/carga geral como referência legada. Quantidade nula gera zero linhas, exigindo que o personal escolha a quantidade.

Ao iniciar uma nova sessão com prescrição LEGADO, uma quantidade conhecida gera snapshots de séries com repetições nulas e carga geral não negativa. A faixa textual continua no snapshot geral. Quantidade desconhecida não gera linhas inventadas.

Execuções anteriores não são reconstruídas usando a prescrição atual. A interface usa somente o snapshot geral antigo e os resultados da própria execução; quando a quantidade é desconhecida, permite adicionar explicitamente linhas realizadas. Nenhum valor planejado é persistido como resultado sem salvamento do aluno.

## Consistência e acesso

Criação/edição/remoção/reordenação de prescrição e início de execução usam o lock pessimista do treino. Edição de nome/status do treino também participa desse lock. Toda a criação de sessão, exercícios e snapshots ocorre na mesma transação. Snapshots não têm FK para a série prescrita atual, não possuem setters e suas colunas de valores não são atualizáveis pelo ORM.

A troca completa de resultados continua sem controle de versão entre dispositivos: a última escrita pode substituir outra edição. O bloqueio de clique da interface não substitui esse controle. Essa limitação não permite alterar snapshots.

GET `/alunos/me/treinos` retorna somente ativos. O PERSONAL mantém a listagem anterior. `/aluno` lista sessões EM_ANDAMENTO separadamente via `/alunos/me/execucoes`, inclusive para treinos desativados. As permissões e o bloqueio de novo início inativo são preservados.

## Recorde futuro

A cadeia `ExecucaoSerie → ExecucaoExercicio → ExecucaoTreino → aluno` identifica o aluno; `ExecucaoExercicio.exercicioIdSnapshot` identifica o exercício independentemente do nome do treino. `cargaUtilizada` mantém o realizado. Será possível consultar a maior carga histórica sem tabela duplicada de recordes. A futura regra deve definir quais status/conclusões entram no cálculo e como excluir a própria edição da comparação. Nenhum cálculo, endpoint ou mensagem de recorde foi implementado.

## Validação manual antes da implantação

- Aplicar V1/V2/V3 em banco descartável e V3 em cópia com histórico; comparar contagens e valores legados.
- Criar, editar, reduzir e aumentar séries; conferir null e zero.
- Iniciar sessão e depois editar a prescrição; verificar snapshots intactos.
- Salvar várias séries, editar uma, recarregar e verificar as demais.
- Desativar treino com sessão aberta; retomar pelo painel de sessões.
- Validar concorrência real de início/edição com duas conexões e permissões entre alunos.
