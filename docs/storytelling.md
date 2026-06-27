# Domain Storytelling — Oficina Mecânica

> [← Voltar ao índice](./README.md)

Toda oficina tem suas histórias. O carro chega na garagem, alguém recebe, alguém olha por baixo, alguém troca a peça, alguém entrega o veículo. O cliente paga, leva, volta meses depois com outro problema. É um vai e vem de pessoas, papéis e ferramentas que, quando contado em ordem, vira o desenho do nosso sistema.

Este documento registra essas histórias do jeito que elas acontecem no nosso domínio. Cada uma é um caminho linear — começa, segue, termina — sem desvios, sem retornos. Quando a história precisa tomar outro rumo (o cliente rejeita o orçamento, por exemplo), ela vira outra história, com começo e fim próprios.

---

## Quem participa

Antes de contar o que acontece, vale apresentar quem está em cena. A gente nomeia as pessoas pela **função** que desempenham, não pelo nome — afinal, hoje pode ser a Ana no balcão e amanhã o João, mas o papel "Atendente" continua o mesmo.

| Ator | Quem é | O que faz |
| --- | --- | --- |
| 🧑 **Cliente** | Pessoa física ou jurídica dona do veículo | Traz o carro, recebe o orçamento, decide e paga |
| 👔 **Atendente** | Funcionário da recepção | Cadastra, abre a OS, conversa com o cliente, entrega o veículo |
| 🔧 **Mecânico** | Funcionário técnico | Diagnostica o problema, monta o orçamento e executa o serviço |
| 👨‍💼 **Admin/Gerente** | Funcionário responsável pelo dia a dia | Cuida do catálogo, do estoque e dos usuários do sistema |
| 💻 **Sistema da Oficina** | A API que estamos construindo | Persiste cadastros, calcula valores, dá baixa em estoque e emite comprovantes |
| 🏭 **Fornecedor** | Parceiro externo | Repõe peças e insumos quando o estoque pede |

## O que circula entre eles

Ao longo de cada história, os atores manipulam coisas — algumas físicas (um carro, uma peça), outras digitais (um cadastro, um orçamento). Esses são os objetos de trabalho.

| Objeto | Natureza |
| --- | --- |
| 🚗 Veículo | Físico |
| 📇 Cadastro do Cliente | Digital |
| 📋 Ordem de Serviço (OS) | Digital |
| 💵 Orçamento (valor final preliminar) | Digital |
| ⚙️ Peça | Física, com reflexo no estoque |
| 🛢️ Insumo | Físico, com reflexo no estoque |
| 🔧 Serviço (do catálogo) | Digital |
| 📦 Estoque | Digital (espelho do físico) |
| 🧾 Comprovante de Entrega | Digital |
| 🔑 Credenciais (e-mail + senha) | Digital |
| 🎫 Tokens JWT | Digital |

## Como ler os diagramas

A gente usa Mermaid em vez da notação pictográfica original — fica versionável no Git e renderiza direto no GitHub. As convenções são:

- **Atores** ficam em caixas arredondadas (`([ ])`)
- **Objetos de trabalho** ficam em caixas duplas (`[[ ]]`)
- **Atividades** são setas numeradas e nomeadas com um verbo (`-- "01 entrega" -->`)
- **Anotações** vêm logo abaixo de cada diagrama, listando regras, validações e gatilhos
- **Grupos** (subdomínios) aparecem como `subgraph`

```mermaid
flowchart LR
    Ator(["👤 Ator"])
    Objeto[["📄 Objeto de Trabalho"]]
    Ator -- "01 verbo da atividade" --> Objeto

    classDef ator fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef objeto fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    class Ator ator
    class Objeto objeto
```

---

## História A — O cliente aprova o orçamento

Esta é a história que a gente espera que aconteça em todo atendimento. O cliente chega com um problema, recebe o diagnóstico, concorda com o valor e leva o carro consertado de volta.

```mermaid
flowchart TB
    Cliente(["🧑 Cliente"])
    Atendente(["👔 Atendente"])
    Mecanico(["🔧 Mecânico"])
    Sistema(["💻 Sistema da Oficina"])

    Veiculo[["🚗 Veículo"]]
    Cadastro[["📇 Cadastro do Cliente"]]
    OS[["📋 Ordem de Serviço"]]
    Itens[["⚙️🛢️🔧 Serviços / Peças / Insumos"]]
    Orcamento[["💵 Orçamento"]]
    Estoque[["📦 Estoque"]]
    Comprovante[["🧾 Comprovante"]]

    subgraph Recepcao["🟦 Atendimento — Recepção"]
        Cliente -- "01 leva" --> Veiculo
        Veiculo -- "ao" --> Atendente
        Atendente -- "02 cadastra/consulta" --> Cadastro
        Atendente -- "03 cadastra" --> Veiculo
        Atendente -- "04 abre (status=recebida)" --> OS
    end

    subgraph Diagnostico["🟧 Oficina — Diagnóstico"]
        Sistema -- "05 atribui" --> OS
        OS -- "ao" --> Mecanico
        Mecanico -- "06 diagnostica (em_diagnostico)" --> Veiculo
        Mecanico -- "07 registra previsão" --> Itens
        Itens -- "na" --> OS
        Sistema -- "08 calcula valor_final<br/>(aguardando_aprovacao)" --> Orcamento
    end

    subgraph Aprovacao["🟦 Atendimento — Aprovação"]
        Atendente -- "09 envia" --> Orcamento
        Orcamento -- "ao" --> Cliente
        Cliente -- "10 aprova" --> Orcamento
    end

    subgraph Execucao["🟧 Oficina — Execução"]
        Mecanico -- "11 executa (em_execucao)" --> Itens
        Sistema -- "12 dá baixa" --> Estoque
        Mecanico -- "13 finaliza (finalizada)" --> OS
    end

    subgraph Entrega["🟦 Atendimento — Entrega"]
        Atendente -- "14 entrega (entregue)" --> Veiculo
        Veiculo -- "ao" --> Cliente
        Sistema -- "15 emite" --> Comprovante
        Comprovante -- "ao" --> Cliente
    end

    classDef ator fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef objeto fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    class Cliente,Atendente,Mecanico,Sistema ator
    class Veiculo,Cadastro,OS,Itens,Orcamento,Estoque,Comprovante objeto
```

**Vale anotar:**

- **02** → Se o cliente é novo, o sistema valida CPF ou CNPJ conforme o tipo (PF/PJ).
- **04** → A OS nasce com `valor_final = 0` e `status = recebida`. Ela só ganha valor quando o mecânico começa a registrar os itens.
- **08** → O valor final é a soma dos serviços, peças e insumos — sempre com o preço **histórico** registrado no momento, não o preço atual do catálogo.
- **09** → No MVP, essa comunicação ainda acontece fora do sistema (telefone, WhatsApp). O serviço de notificação está no roadmap.
- **12** → A baixa do estoque é transacional. Se algo falha, a OS e o estoque permanecem consistentes — não tem como o estoque baixar sem a OS avançar.
- **15** → O comprovante é digital; o pagamento em si ainda não foi modelado nesta fase.

---

## História B — O cliente rejeita o orçamento

Nem todo orçamento fecha. Às vezes o cliente acha caro, decide adiar, ou prefere levar pra outra oficina. Esta história começa no mesmo ponto da anterior, mas termina antes da execução — o veículo volta intacto para o dono.

```mermaid
flowchart TB
    Cliente(["🧑 Cliente"])
    Atendente(["👔 Atendente"])
    Sistema(["💻 Sistema da Oficina"])

    Orcamento[["💵 Orçamento"]]
    OS[["📋 Ordem de Serviço"]]
    Veiculo[["🚗 Veículo"]]

    Atendente -- "01 envia" --> Orcamento
    Orcamento -- "ao" --> Cliente
    Cliente -- "02 rejeita" --> Orcamento
    Cliente -- "03 informa rejeição" --> Atendente
    Atendente -- "04 cancela (status=cancelada)" --> OS
    Sistema -- "05 preserva" --> Veiculo
    Atendente -- "06 devolve" --> Veiculo
    Veiculo -- "ao" --> Cliente

    classDef ator fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef objeto fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    class Cliente,Atendente,Sistema ator
    class Orcamento,OS,Veiculo objeto
```

**Vale anotar:**

- **04** → O status `cancelada` ainda não existe no enum atual da OS — está sugerido para a próxima sprint. Por ora, OSs rejeitadas ficam paradas em `aguardando_aprovacao`.
- **05** → Nada é debitado do estoque, porque a execução nunca começou. O orçamento previa, mas não consumiu.
- A OS rejeitada **não vira** uma OS aceita depois. Se o cliente mudar de ideia, abre-se uma nova OS do zero.

---

## História D — Reposição do estoque

Peça e insumo se gastam. Quando a quantidade disponível chega no limite, alguém precisa correr atrás do fornecedor antes que falte na hora do serviço.

```mermaid
flowchart TB
    Admin(["👨‍💼 Admin/Gerente"])
    Sistema(["💻 Sistema da Oficina"])
    Fornecedor(["🏭 Fornecedor"])

    Estoque[["📦 Estoque (Peças/Insumos)"]]
    Pedido[["📝 Pedido de Reposição"]]
    NF[["🧾 Nota Fiscal"]]

    Sistema -- "01 sinaliza nível baixo" --> Estoque
    Estoque -- "ao" --> Admin
    Admin -- "02 monta" --> Pedido
    Admin -- "03 envia" --> Pedido
    Pedido -- "ao" --> Fornecedor
    Fornecedor -- "04 entrega" --> Estoque
    Fornecedor -- "05 emite" --> NF
    NF -- "ao" --> Admin
    Admin -- "06 dá entrada (qtd_estoque+=)" --> Estoque

    classDef ator fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef objeto fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    class Admin,Sistema,Fornecedor ator
    class Estoque,Pedido,NF objeto
```

**Vale anotar:**

- **01** → O alerta automático ainda não existe; hoje o Admin precisa olhar a listagem manualmente. Faz parte do módulo de Relatórios planejado.
- **03** → A comunicação com o fornecedor é totalmente offline (telefone, e-mail). Integração direta é roadmap futuro.
- **06** → A entrada é manual: o Admin abre o cadastro da peça/insumo e ajusta a quantidade. Auditoria dessa operação fica registrada via `criado_em`/`atualizado_em`.

---

## História E — O primeiro contato

Quando o cliente nunca veio aqui antes, é preciso criar tudo do zero: o cadastro do cliente e o cadastro do veículo. Essa história é um detalhamento dos passos 02 e 03 da História A — quando a gente abre o "como cadastra um cliente novo".

```mermaid
flowchart TB
    Cliente(["🧑 Cliente"])
    Atendente(["👔 Atendente"])
    Sistema(["💻 Sistema da Oficina"])

    Documento[["📄 CPF / CNPJ"]]
    Cadastro[["📇 Cadastro do Cliente"]]
    DadosVeiculo[["📋 Dados do Veículo (placa, marca, modelo)"]]
    Veiculo[["🚗 Veículo"]]

    Cliente -- "01 apresenta" --> Documento
    Documento -- "ao" --> Atendente
    Atendente -- "02 valida CPF/CNPJ" --> Documento
    Atendente -- "03 cria" --> Cadastro
    Sistema -- "04 verifica duplicidade" --> Cadastro
    Atendente -- "05 coleta" --> DadosVeiculo
    Atendente -- "06 cria" --> Veiculo
    Sistema -- "07 verifica placa duplicada" --> Veiculo
    Sistema -- "08 associa cliente↔veículo" --> Cadastro

    classDef ator fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef objeto fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    class Cliente,Atendente,Sistema ator
    class Documento,Cadastro,DadosVeiculo,Veiculo objeto
```

**Vale anotar:**

- **02** → A validação acontece no `cpf-cnpj.validator.ts`. O tipo informado pelo cliente (PF ou PJ) define qual algoritmo de dígito verificador rodar.
- **04** e **07** → Documento e placa são únicos no sistema — o cadastro falha se já existirem ativos.
- **08** → A relação cliente ↔ veículo é N:N. Um carro pode passar pela oficina com donos diferentes ao longo dos anos, e cada um fica registrado.

---

## História F — Funcionário entrando no sistema

Antes de qualquer atendimento começar, o funcionário precisa se identificar. Esta é a história mais curta do conjunto, mas atravessa todas as outras: sem ela, nenhuma das anteriores acontece.

```mermaid
flowchart TB
    Funcionario(["👤 Funcionário"])
    Sistema(["💻 Sistema da Oficina"])

    Credenciais[["🔑 Credenciais (email + senha)"]]
    AccessToken[["🎫 Access Token (JWT curto)"]]
    RefreshToken[["♻️ Refresh Token (JWT longo)"]]
    HashRefresh[["🗄️ Hash do Refresh (no banco)"]]

    Funcionario -- "01 informa" --> Credenciais
    Credenciais -- "ao" --> Sistema
    Sistema -- "02 valida com bcrypt" --> Credenciais
    Sistema -- "03 gera" --> AccessToken
    Sistema -- "04 gera" --> RefreshToken
    Sistema -- "05 persiste hash" --> HashRefresh
    AccessToken -- "ao" --> Funcionario
    RefreshToken -- "ao" --> Funcionario

    classDef ator fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef objeto fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    class Funcionario,Sistema ator
    class Credenciais,AccessToken,RefreshToken,HashRefresh objeto
```

**Vale anotar:**

- **02** → A senha nunca chega ao banco em texto plano — a comparação é feita com `bcrypt.compare` contra o hash armazenado.
- **05** → Só o **hash** do refresh token vai pro banco. Isso permite revogar uma sessão (logout) e fazer rotação a cada renovação, sem nunca expor o token cru.
- O funcionário guarda os tokens no cliente (header `Authorization: Bearer ...`); o servidor não mantém sessão.

---

## Como as histórias se encaixam nos bounded contexts

Cada história vive em um ou mais contextos delimitados do domínio. O diagrama abaixo mostra onde cada uma toca:

```mermaid
flowchart LR
    subgraph Identidade["🔐 Identidade"]
        F["História F<br/>Autenticação"]
    end

    subgraph Atendimento["🟦 Atendimento"]
        E["História E<br/>Primeiro contato"]
        B["História B<br/>Cliente rejeita orçamento"]
        A1["História A (01–04, 09–10, 14–15)<br/>Recepção & Entrega"]
    end

    subgraph Oficina["🟧 Oficina"]
        A2["História A (05–08, 11, 13)<br/>Diagnóstico & Execução"]
    end

    subgraph Estoque["📦 Estoque"]
        A3["História A (12)<br/>Baixa de estoque"]
        D["História D<br/>Reposição"]
    end

    F --> Atendimento
    F --> Oficina
    F --> Estoque
    Atendimento --> Oficina
    Oficina --> Estoque

    classDef ctx fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    class Identidade,Atendimento,Oficina,Estoque ctx
```

A Identidade é transversal — sustenta as outras três. O fluxo natural do negócio segue da esquerda para a direita: o atendimento abre a OS, a oficina executa, o estoque acompanha o que sai. A reposição (História D) alimenta o estoque por fora desse fluxo principal, mas no mesmo contexto.

---

## Quem contou essas histórias — Grupo 66

A narrativa acima foi construída em conjunto pela equipe do Grupo 66:

| Integrante | Papel na construção |
| --- | --- |
| Nayara | Domain Expert / Modeladora |
| Pedro | Domain Expert / Modelador |
| Matheus | Domain Expert / Moderador |
| Guilherme | Domain Expert / Ouvinte |
| Aléxia | Domain Expert / Ouvinte |

Os papéis circularam entre as sessões — todo mundo contou parte da história, todo mundo desenhou em algum momento.

---

## Referências

- HOFER, S.; SCHWENTNER, H. *Domain Storytelling: A Collaborative, Visual, and Agile Way to Build Domain-Driven Software*. Addison-Wesley, 2021.
- COCKBURN, A. *Writing Effective Use Cases*. Addison-Wesley, 2001.
- EVANS, E. *Domain-Driven Design: Tackling Complexity in the Heart of Software*. Pearson Education, 2003.
- [Board de Event Storming / DDD no Miro](https://miro.com/app/board/uXjVHPI3bCE=/) — modelagem que originou estas histórias.
- [Linguagem Ubíqua](./03-linguagem-ubiqua.md) — dicionário dos termos usados aqui.
- [egon.io](https://egon.io) — ferramenta de referência para diagramas pictográficos de Domain Storytelling.
