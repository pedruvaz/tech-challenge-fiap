# 9 · Relatório de Vulnerabilidades

> [← Voltar ao índice](./README.md)

Relatório de análise de vulnerabilidades das dependências do projeto, gerado com **`npm audit`**.

## Metadados da análise

| Item | Valor |
| ---- | ----- |
| Data da análise | 2026-06-27 |
| Branch | `dev` (commit `cf3742d`) |
| Ferramenta | `npm audit` (npm 10.9.3) |
| Node.js | v22.18.0 |

### Como reproduzir

```bash
npm audit              # resumo legível no terminal
npm audit --json       # saída completa em JSON
npm audit --omit=dev   # apenas dependências de produção
```

## Resumo executivo

| Severidade | Quantidade |
| ---------- | ---------- |
| 🔴 Crítica | 0 |
| 🟠 Alta | 0 |
| 🟡 Moderada | 0 |
| ⚪ Baixa | 0 |
| **Total** | **0** |

```
$ npm audit
found 0 vulnerabilities

$ npm audit --omit=dev
found 0 vulnerabilities
```

Nenhuma vulnerabilidade foi detectada — nem na árvore completa, nem apenas no escopo de produção.

## Como chegamos a zero

Em ciclos anteriores deste projeto o `npm audit` reportou **28 ocorrências** derivadas de 5 _advisories_ raiz em dependências transitivas dos pacotes do NestJS, Swagger e Prisma CLI:

- `form-data` — CRLF injection ([GHSA-hmw2-7cc7-3qxx](https://github.com/advisories/GHSA-hmw2-7cc7-3qxx))
- `multer` — DoS via campos profundamente aninhados e cleanup incompleto de uploads abortados ([GHSA-72gw-mp4g-v24j](https://github.com/advisories/GHSA-72gw-mp4g-v24j), [GHSA-3p4h-7m6x-2hcm](https://github.com/advisories/GHSA-3p4h-7m6x-2hcm))
- `js-yaml` — DoS quadrático em merge keys ([GHSA-h67p-54hq-rp68](https://github.com/advisories/GHSA-h67p-54hq-rp68))
- `@hono/node-server` — bypass de middleware no `serveStatic` ([GHSA-92pp-h63x-v22m](https://github.com/advisories/GHSA-92pp-h63x-v22m))
- Cadeia Jest (`babel-plugin-istanbul`, `@istanbuljs/load-nyc-config`, etc.) — vulnerabilidade transitiva da toolchain de testes

Em vez de aplicar `npm audit fix --force` (que sugeria downgrades quebráveis para versões muito antigas do NestJS), foram declarados **overrides no `package.json`** forçando versões corrigidas:

```jsonc
"overrides": {
  "@hono/node-server": "$@hono/node-server",
  "js-yaml": "$js-yaml",
  "multer": "$multer"
}
```

A sintaxe `"$pkg"` instrui o npm a usar a versão que o projeto já declara em `dependencies`, propagando-a para toda a árvore transitiva. Combinado com atualizações pontuais do NestJS e da toolchain de testes, os advisories deixaram de aparecer.

## Política de monitoramento contínuo

- O `npm audit` é executado localmente antes de cada release.
- Em CI, qualquer novo advisory é capturado pelos jobs de teste/lint quando uma dependência atualiza.
- Caso `npm audit` volte a reportar vulnerabilidades, este relatório deve ser atualizado e a remediação documentada na seção acima.

## Plano em caso de regressão futura

| Ação | Detalhe | Quebra? |
| ---- | ------- | ------- |
| Aplicar correções não-quebra | `npm audit fix` resolve patches sem mudança de major | Não |
| Acompanhar releases do NestJS | Os pacotes do `@nestjs/*` frequentemente trazem patches transitivos | — |
| Atualizar toolchain de testes | Manter `jest`/`ts-jest` atualizados; impacto restrito a dev | Possível (major) |
| Adicionar/atualizar `overrides` | Quando o patch não chega via dependência direta | Verificar |

> ⚠️ **Não rodar `npm audit fix --force` às cegas.** Para várias dependências do NestJS, a sugestão é um _downgrade major_ que reintroduziria incompatibilidades graves.

## Conclusão

O projeto está **livre de vulnerabilidades conhecidas** no estado atual (0 ocorrências em todas as severidades, tanto na árvore completa quanto apenas em produção). A higiene de dependências é mantida via patches diretos e `overrides` controlados, e este relatório deve ser revisado a cada ciclo de entrega.
