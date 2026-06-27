# Domain Storytelling — Oficina Mecânica

> [← Voltar ao índice](./README.md)

Toda oficina tem suas histórias. O carro chega, alguém recebe, alguém olha por baixo, alguém troca a peça, alguém entrega o veículo. Quando essa sequência é contada em ordem, vira o desenho do nosso sistema.

Este documento registra as duas histórias centrais do nosso domínio: a do orçamento aceito e a do orçamento rejeitado. Cada uma é um caminho linear, sem desvios nem retornos — quando o fluxo precisa tomar outro rumo, vira história nova, com começo e fim próprios.

---

## Quem participa

Nomeamos as pessoas pela **função**, não pelo nome — hoje pode ser a Ana no balcão e amanhã o João, mas o papel "Atendente" continua o mesmo.

| Ator | O que faz |
| --- | --- |
| 🧑 **Cliente** | Traz o carro, recebe o orçamento, decide e paga |
| 👔 **Atendente** | Cadastra, abre a OS, conversa com o cliente, entrega o veículo |
| 🔧 **Mecânico** | Diagnostica o problema, monta o orçamento e executa o serviço |
| 💻 **Sistema da Oficina** | Persiste cadastros, calcula valores, dá baixa no estoque e emite comprovantes |

## O que circula entre eles

| Objeto | Natureza |
| --- | --- |
| 🚗 Veículo | Físico |
| 📇 Cadastro do Cliente | Digital |
| 📋 Ordem de Serviço (OS) | Digital |
| 💵 Orçamento | Digital |
| ⚙️🛢️🔧 Peças / Insumos / Serviços | Peça e insumo são físicos (refletem no estoque); serviço é catálogo digital |
| 📦 Estoque | Digital, espelho do físico |
| 🧾 Comprovante de Entrega | Digital |

## Como ler os diagramas

Usamos Mermaid em vez da notação pictográfica original — versionável no Git e renderiza direto no GitHub.

- **Atores** em caixas arredondadas (`([ ])`)
- **Objetos de trabalho** em caixas duplas (`[[ ]]`)
- **Atividades** como setas numeradas e nomeadas com verbo (`-- "01 entrega" -->`)
- **Grupos** (subdomínios) como `subgraph`

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
- **04** → A OS nasce com `valor_final = 0`; só ganha valor quando o mecânico registra os itens.
- **08** → O valor final usa o preço **histórico** dos itens, não o do catálogo atual.
- **09** → A comunicação acontece fora do sistema no MVP (telefone, WhatsApp); notificação está no roadmap.
- **12** → A baixa do estoque é transacional — OS e estoque permanecem sempre consistentes.
- **15** → O comprovante é digital; o pagamento em si não foi modelado nesta fase.

---

## História B — O cliente rejeita o orçamento

Nem todo orçamento fecha. Esta história começa no mesmo ponto da anterior, mas termina antes da execução: o veículo volta intacto para o dono.

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

- **04** → O status `cancelada` ainda não existe no enum atual; está sugerido para a próxima sprint. Por ora, OSs rejeitadas ficam em `aguardando_aprovacao`.
- **05** → Nada é debitado do estoque — o orçamento previa, mas a execução nunca começou.
- A OS rejeitada **não vira** uma OS aceita depois: se o cliente mudar de ideia, abre-se uma nova.

---

## Como as histórias se encaixam nos bounded contexts

A História A atravessa três contextos delimitados; a B vive inteira no Atendimento.

```mermaid
flowchart LR
    subgraph Atendimento["🟦 Atendimento"]
        A1["História A (01–04, 09–10, 14–15)<br/>Recepção, Aprovação & Entrega"]
        B["História B<br/>Cliente rejeita orçamento"]
    end

    subgraph Oficina["🟧 Oficina"]
        A2["História A (05–08, 11, 13)<br/>Diagnóstico & Execução"]
    end

    subgraph Estoque["📦 Estoque"]
        A3["História A (12)<br/>Baixa de estoque"]
    end

    Atendimento --> Oficina
    Oficina --> Estoque

    classDef ctx fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    class Atendimento,Oficina,Estoque ctx
```

Quando o cliente aceita, o fluxo segue da esquerda para a direita: Atendimento abre a OS, Oficina executa, Estoque registra a baixa. Quando rejeita, nada chega à Oficina nem ao Estoque — a OS é encerrada na recepção.

---

## Quem contou essas histórias — Grupo 66

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
