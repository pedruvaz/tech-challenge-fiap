# 9 · Relatório de Vulnerabilidades

> [← Voltar ao índice](./README.md)

Relatório de análise de vulnerabilidades das dependências do projeto, gerado com **`npm audit`**.

## Metadados da análise

| Item | Valor |
| ---- | ----- |
| Data da análise | 2026-06-25 |
| Branch | `dev` (commit `9c57241`, atualizada via `git pull origin dev`) |
| Ferramenta | `npm audit` (npm 10.9.3) |
| Node.js | v22.18.0 |
| Dependências analisadas | 868 (275 produção, 574 desenvolvimento, 32 opcionais) |

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
| 🟠 Alta | 7 |
| 🟡 Moderada | 21 |
| ⚪ Baixa | 0 |
| **Total** | **28** |

Nenhuma vulnerabilidade **crítica** foi encontrada. As 28 ocorrências derivam de **5 advisories raiz** propagados por dependências transitivas (a maior parte são re-contagens da mesma causa em pacotes do ecossistema Jest e NestJS).

## Vulnerabilidades raiz (causa real)

| Pacote | Severidade | CVSS | Advisory | Origem | Afeta produção? |
| ------ | ---------- | ---- | -------- | ------ | --------------- |
| **form-data** | 🟠 Alta | 7.5 | [GHSA-hmw2-7cc7-3qxx](https://github.com/advisories/GHSA-hmw2-7cc7-3qxx) — CRLF injection via nomes de campo/arquivo não escapados | Transitiva (`@nestjs/platform-express`) | Sim |
| **multer** | 🟠 Alta | 7.5 / 5.3 | [GHSA-72gw-mp4g-v24j](https://github.com/advisories/GHSA-72gw-mp4g-v24j) e [GHSA-3p4h-7m6x-2hcm](https://github.com/advisories/GHSA-3p4h-7m6x-2hcm) — DoS via campos profundamente aninhados e limpeza incompleta de uploads abortados | Transitiva (`@nestjs/platform-express`) | Sim |
| **js-yaml** | 🟡 Moderada | 5.3 | [GHSA-h67p-54hq-rp68](https://github.com/advisories/GHSA-h67p-54hq-rp68) — DoS de complexidade quadrática no tratamento de merge keys | Transitiva (`@nestjs/swagger`) | Sim |
| **@hono/node-server** | 🟡 Moderada | 5.3 | [GHSA-92pp-h63x-v22m](https://github.com/advisories/GHSA-92pp-h63x-v22m) — bypass de middleware via barras repetidas no `serveStatic` | Transitiva (`prisma` / `@prisma/dev`) | Não (dev) |
| **Cadeia Jest** (`@jest/*`, `babel-jest`, `ts-jest`, `@istanbuljs/load-nyc-config`, `babel-plugin-istanbul`, etc.) | 🟡 Moderada | — | Vulnerabilidade transitiva na toolchain de testes | Transitiva (`jest`, `ts-jest`) | Não (dev) |

> As 21 ocorrências moderadas restantes (`@jest/core`, `jest-cli`, `jest-runtime`, `babel-jest`, …) são re-contagens da **cadeia Jest** acima — todas em dependências **de desenvolvimento**, sem exposição em runtime de produção.

## Análise de impacto

- **Produção (runtime exposto):** `form-data`, `multer` e `js-yaml` chegam via `@nestjs/platform-express` e `@nestjs/swagger`. São cenários de **DoS** e **CRLF injection** ligados a *upload de arquivos* e *parsing de YAML*. A API atual **não expõe endpoints de upload** (não usa `multer`/`FileInterceptor`), o que **reduz drasticamente a superfície de ataque** das falhas de `multer`/`form-data` hoje. Ainda assim, devem ser corrigidas conforme as versões de patch forem publicadas pelo NestJS.
- **Desenvolvimento (sem exposição em produção):** toda a cadeia Jest e o `@hono/node-server` (puxado pelo CLI do Prisma) **não vão para a imagem de produção** (o `Dockerfile` multi-stage instala apenas dependências de produção no estágio final). O risco real é baixo.

## Plano de remediação

| Ação | Detalhe | Quebra? |
| ---- | ------- | ------- |
| Aplicar correções não-quebra | `npm audit fix` resolve as falhas com patch disponível sem mudança de major (ex.: `form-data`) | Não |
| Acompanhar releases do NestJS | A correção de `multer`/`js-yaml` virá pela atualização de `@nestjs/platform-express` e `@nestjs/swagger` para um patch — **não** fazer o downgrade para `@nestjs/core@7.5.5` que o `npm audit fix --force` sugere (regressão de 4 versões major) | — |
| Atualizar toolchain de testes | Manter `jest`/`ts-jest` atualizados; impacto restrito a desenvolvimento | Possível (major) |

> ⚠️ **Não rodar `npm audit fix --force` às cegas.** Para várias dependências, a "correção" sugerida é um **downgrade major** do NestJS (`@nestjs/core@7.5.5`), o que reintroduziria incompatibilidades graves. Preferir `npm audit fix` (sem `--force`) e atualizações pontuais validadas pela CI.

## Conclusão

O projeto **não possui vulnerabilidades críticas**. As falhas de severidade alta estão em dependências transitivas de upload/serialização cuja superfície de ataque é mínima no estado atual da API (sem endpoints de upload). A recomendação é aplicar `npm audit fix` e acompanhar os patches do NestJS, mantendo este relatório atualizado a cada ciclo de entrega.
