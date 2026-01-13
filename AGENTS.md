# AGENTS

## Visao geral
- Objetivo: apoiar manutencao e evolucao do app mantendo consistencia de API, tipagens e UI.
- Padrao preferido: services por dominio + api client unico.

## Estrutura de requisicoes
- Client: `services/api-client.ts` com baseURL do Expo e interceptor de token.
- Servicos:
  - `services/desafios-service.ts`
  - `services/users-service.ts`
  - (expandir para auth/tasks/payments/config quando necessario)
- Tipagens por endpoint em `@types/*.d.ts`.

## Regras
- Evitar URLs hardcoded; sempre usar o client ou services.
- Padronizar erros com helper (`getErrorMessage`).
- Usar tipos de `@types` em queries/mutations.
- Evitar logs sensiveis em producao.

## Convencoes de arquivos
- Requisicoes: `services/<dominio>-service.ts`.
- Tipos: `@types/<endpoint>.d.ts`.
- Não usar `utils/api-service.ts` (removido); importar direto dos services.
