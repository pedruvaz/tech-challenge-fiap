# Melhorias de Docker, Segurança e Pipeline

## Objetivo

Este conjunto de alterações teve como objetivo melhorar a segurança,
otimizar a construção da imagem Docker e reduzir seu tamanho, além de
organizar a pipeline de integração contínua.

## Alterações realizadas

### Dockerfile

-   Implementação de **multi-stage build** para separar build e runtime.
-   Utilização da imagem `node:22-alpine` para reduzir o tamanho da
    imagem.
-   Configuração do ambiente de produção com `NODE_ENV=production`.
-   Instalação apenas das dependências de produção
    (`npm ci --omit=dev`).
-   Limpeza do cache do npm (`npm cache clean --force`).
-   Execução da aplicação com usuário não privilegiado (`USER node`).
-   Inicialização da aplicação com `node dist/main`.

### Docker Compose

-   Organização dos serviços (`api`, `db` e `pgadmin`).
-   Inclusão de `healthcheck` para o PostgreSQL.
-   Uso de `depends_on` com verificação de saúde do banco.
-   Restrição das portas para acesso apenas local (`127.0.0.1`).
-   Aplicação da política `no-new-privileges`.
-   Separação dos serviços em uma rede dedicada (`backend`).
-   Persistência dos dados utilizando volumes nomeados.

### Segurança

-   Execução da aplicação sem privilégios de root.
-   Redução da superfície de ataque com `no-new-privileges`.
-   Isolamento dos serviços em rede própria.
-   Exposição apenas das portas necessárias.

### Otimização da imagem

-   Adoção de build em múltiplas etapas.
-   Remoção de dependências de desenvolvimento da imagem final.
-   Limpeza do cache do npm.
-   Revisão das dependências do projeto.
-   Redução do tamanho da imagem Docker de aproximadamente **1,34 GB**
    para **812 MB**.

### Pipeline

-   Correção da configuração do GitHub Actions.
-   Ajustes no processo de build.
-   Revisão do processo de publicação da aplicação.

## Benefícios obtidos

-   Redução significativa do tamanho da imagem Docker.
-   Melhor organização do ambiente de containers.
-   Maior segurança da aplicação.
-   Builds mais limpos e reproduzíveis.
-   Estrutura mais alinhada às boas práticas de Docker e DevOps.

## Comparativo do tamanho da imagem Docker

Durante o processo de otimização foram realizadas diversas melhorias no `Dockerfile` e na estratégia de construção da imagem, incluindo a adoção de **multi-stage build**, utilização da imagem base **Node Alpine**, instalação apenas das dependências necessárias para produção, limpeza do cache do `npm` e revisão das dependências utilizadas pela aplicação.

Como resultado, o tamanho da imagem Docker foi reduzido de aproximadamente **1,34 GB** para **812 MB**, representando uma redução de cerca de **39%**.

| Situação              |              Tamanho |
| --------------------- | -------------------: |
| Antes das otimizações |          **1,34 GB** |
| Após as otimizações   |           **812 MB** |
| Redução obtida        | **≈ 528 MB (≈ 39%)** |

Além da redução no tamanho da imagem, as alterações proporcionaram outros benefícios importantes:

* Menor tempo de transferência da imagem entre ambientes e registries.
* Builds mais eficientes e reprodutíveis.
* Menor consumo de armazenamento.
* Redução da superfície de ataque ao remover componentes desnecessários da imagem final.
* Ambiente de produção mais limpo, contendo apenas os artefatos e dependências essenciais para execução da aplicação.