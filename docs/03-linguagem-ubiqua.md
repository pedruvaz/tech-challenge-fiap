# 3 · Dicionário de Linguagem Ubíqua

> [← Voltar ao índice](./README.md)

A **linguagem ubíqua** é o vocabulário comum entre o time técnico e o negócio. Os termos abaixo são usados de forma consistente no código, nas APIs e na documentação.

> 🔗 Esta linguagem ubíqua e os bounded contexts foram derivados da modelagem de domínio feita via **Event Storming**: **[Board de Event Storming / DDD no Miro](https://miro.com/app/board/uXjVHPI3bCE=/)**.

| Termo | Definição |
| ----- | --------- |
| **Oficina** | Estabelecimento que presta serviços de manutenção e reparo de veículos. É o contexto de negócio do sistema. |
| **Usuário** | Pessoa que opera o sistema. Possui um papel (_role_): `admin`, `funcionario` ou `mecanico`. |
| **Mecânico** | Usuário responsável por executar os serviços registrados em uma Ordem de Serviço. |
| **Cliente** | Proprietário do veículo atendido. Pode ser **Pessoa Física** (CPF) ou **Pessoa Jurídica** (CNPJ). |
| **Pessoa Física (PF)** | Cliente identificado por **CPF**. |
| **Pessoa Jurídica (PJ)** | Cliente identificado por **CNPJ**. |
| **Número de Documento** | CPF ou CNPJ do cliente; identificador único e validado conforme o tipo. |
| **Veículo** | Automóvel atendido pela oficina, identificado pela **placa**. Pode estar associado a um ou mais clientes. |
| **Ordem de Serviço (OS)** | Registro central do atendimento: vincula cliente, veículo e mecânico, controla o status e consolida o valor final. |
| **Status da OS** | Estágio atual do atendimento. Ver tabela de status abaixo. |
| **Valor Final** | Soma dos serviços realizados, peças utilizadas e insumos consumidos em uma OS. |
| **Serviço** | Item do catálogo de mão de obra oferecido pela oficina (ex.: "troca de óleo"), com descrição e valor. |
| **Peça** | Componente físico aplicado ao veículo (ex.: filtro, pastilha de freio), controlado em estoque. |
| **Insumo** | Material de consumo usado durante o serviço (ex.: óleo, graxa), controlado em estoque. |
| **Estoque** | Quantidade disponível de uma peça ou insumo (`qtd_estoque`). |
| **Serviço Realizado** | Serviço efetivamente aplicado em uma OS, com quantidade e valor histórico. |
| **Peça Utilizada** | Peça efetivamente aplicada em uma OS, com quantidade e valor histórico. |
| **Insumo Consumido** | Insumo efetivamente gasto em uma OS, com quantidade e valor histórico. |
| **Soft Delete** | Remoção lógica: o registro é marcado como excluído (`deletado_em`) sem ser apagado do banco. |
| **Access Token** | Token JWT de curta duração que autentica cada requisição. |
| **Refresh Token** | Token JWT de longa duração usado para renovar o access token; armazenado com hash e revogável. |

## Bounded Contexts

A partir do Event Storming, o domínio foi dividido em **contextos delimitados** (_bounded contexts_), cada um responsável por um conjunto coeso de conceitos e regras:

| Bounded Context | Responsabilidade | Principais conceitos |
| --------------- | ---------------- | -------------------- |
| **Atendimento** | Recepção e relacionamento com o cliente e a abertura/condução comercial da OS | Cliente, Veículo, Ordem de Serviço, Orçamento, Aprovação, Autorização, Notificação |
| **Oficina** | Execução técnica do serviço pelo mecânico | Status, Diagnóstico, Serviços executados, Mecânico, Tempo médio, Problemas adicionais |
| **Estoque** | Controle de peças e insumos disponíveis e sua movimentação | Peça, Insumo, Reserva, Baixa, Reposição |
| **Identidade** | Autenticação, autorização e gestão de usuários | Usuário, JWT, Permissões, Perfil (_role_) |

### Atores e personas

| Tipo | Atores |
| ---- | ------ |
| **Internos** | Atendente, Mecânico, Admin/Gerente (genericamente, **Funcionário**) |
| **Externos** | Cliente, Fornecedor |

### Sistemas externos

- **API de endereço** — consulta/validação de endereços.
- **Serviço de notificação** — comunicação com o cliente (ex.: envio do orçamento).
- **Fornecedor de peças e insumos** — reposição de estoque.

## Status da Ordem de Serviço

| Status | Significado |
| ------ | ----------- |
| `recebida` | OS aberta; veículo recebido na oficina. |
| `em_diagnostico` | Mecânico avaliando o problema. |
| `aguardando_aprovacao` | Orçamento enviado, aguardando autorização do cliente. |
| `em_execucao` | Serviços sendo executados. |
| `finalizada` | Serviços concluídos; veículo pronto. |
| `entregue` | Veículo devolvido ao cliente. |
