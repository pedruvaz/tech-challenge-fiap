import { PrismaClient, Roles, Status, Tipo } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const SALT_ROUNDS = 10;
const hash = (senha: string) => bcrypt.hash(senha, SALT_ROUNDS);

// Todos os usuários do seed compartilham a mesma senha de demonstração.
const SENHA_PADRAO = 'senha123';

// Os três primeiros registros de cada bloco são os originais: a suíte e2e
// depende deles (joao.mecanico, cliente 123.456.789-09, placa ABC-1234).
// Não renomeie nem remova — só acrescente depois deles.

const USUARIOS = [
  { nome: 'Administrador', email: 'admin@oficina.com', roles: Roles.admin },
  {
    nome: 'João Silva',
    email: 'joao.mecanico@oficina.com',
    roles: Roles.mecanico,
  },
  {
    nome: 'Carlos Souza',
    email: 'carlos.mecanico@oficina.com',
    roles: Roles.mecanico,
  },
  {
    nome: 'Ana Ribeiro',
    email: 'ana.mecanica@oficina.com',
    roles: Roles.mecanico,
  },
  {
    nome: 'Rafael Mendes',
    email: 'rafael.mecanico@oficina.com',
    roles: Roles.mecanico,
  },
  {
    nome: 'Juliana Prado',
    email: 'juliana.mecanica@oficina.com',
    roles: Roles.mecanico,
  },
  {
    nome: 'Fernanda Lima',
    email: 'fernanda.atendimento@oficina.com',
    roles: Roles.funcionario,
  },
  {
    nome: 'Bruno Teixeira',
    email: 'bruno.atendimento@oficina.com',
    roles: Roles.funcionario,
  },
];

// CPFs/CNPJs com dígito verificador válido (exceto o CNPJ original da
// Transportes Rápido, mantido como está para não duplicar em bases existentes).
const CLIENTES = [
  {
    numDocumento: '123.456.789-09',
    nome: 'Maria Oliveira',
    telefone: '(11) 99999-1111',
    tipo: Tipo.pessoa_fisica,
  },
  {
    numDocumento: '987.654.321-00',
    nome: 'Pedro Costa',
    telefone: '(11) 98888-2222',
    tipo: Tipo.pessoa_fisica,
  },
  {
    numDocumento: '12.345.678/0001-90',
    nome: 'Transportes Rápido Ltda',
    telefone: '(11) 3333-4444',
    tipo: Tipo.pessoa_juridica,
  },
  {
    numDocumento: '529.982.247-25',
    nome: 'Lucas Almeida',
    telefone: '(11) 97777-3333',
    email: 'lucas.almeida@email.com',
    tipo: Tipo.pessoa_fisica,
  },
  {
    numDocumento: '286.255.878-87',
    nome: 'Beatriz Santos',
    telefone: '(11) 96666-4444',
    email: 'beatriz.santos@email.com',
    tipo: Tipo.pessoa_fisica,
  },
  {
    numDocumento: '390.533.447-05',
    nome: 'Gabriel Ferreira',
    telefone: '(21) 95555-5555',
    email: 'gabriel.ferreira@email.com',
    tipo: Tipo.pessoa_fisica,
  },
  {
    numDocumento: '714.602.380-01',
    nome: 'Camila Rocha',
    telefone: '(21) 94444-6666',
    email: 'camila.rocha@email.com',
    tipo: Tipo.pessoa_fisica,
  },
  {
    numDocumento: '861.547.023-53',
    nome: 'Rodrigo Martins',
    telefone: '(31) 93333-7777',
    email: 'rodrigo.martins@email.com',
    tipo: Tipo.pessoa_fisica,
  },
  {
    numDocumento: '453.178.209-79',
    nome: 'Larissa Gomes',
    telefone: '(31) 92222-8888',
    email: 'larissa.gomes@email.com',
    tipo: Tipo.pessoa_fisica,
  },
  {
    numDocumento: '168.995.350-09',
    nome: 'Thiago Barbosa',
    telefone: '(41) 91111-9999',
    email: 'thiago.barbosa@email.com',
    tipo: Tipo.pessoa_fisica,
  },
  {
    numDocumento: '047.392.815-97',
    nome: 'Patrícia Nunes',
    telefone: '(41) 99876-5432',
    email: 'patricia.nunes@email.com',
    tipo: Tipo.pessoa_fisica,
  },
  {
    numDocumento: '11.222.333/0001-81',
    nome: 'Entregas Expressas S.A.',
    telefone: '(11) 3555-1000',
    email: 'frota@entregasexpressas.com.br',
    tipo: Tipo.pessoa_juridica,
  },
  {
    numDocumento: '45.321.789/0001-10',
    nome: 'Locadora Bom Caminho Ltda',
    telefone: '(11) 3666-2000',
    email: 'manutencao@bomcaminho.com.br',
    tipo: Tipo.pessoa_juridica,
  },
  {
    numDocumento: '60.987.432/0001-60',
    nome: 'Padaria Pão Quente ME',
    telefone: '(21) 3777-3000',
    email: 'contato@paoquente.com.br',
    tipo: Tipo.pessoa_juridica,
  },
  {
    numDocumento: '27.531.864/0001-96',
    nome: 'Construtora Alicerce Ltda',
    telefone: '(31) 3888-4000',
    email: 'compras@alicerce.com.br',
    tipo: Tipo.pessoa_juridica,
  },
];

// `donos` referencia clientes pelo documento; um veículo pode ter mais de um.
const VEICULOS = [
  {
    placa: 'ABC-1234',
    marca: 'Toyota',
    modelo: 'Corolla',
    ano: '2020',
    cor: 'Prata',
    donos: ['123.456.789-09'],
  },
  {
    placa: 'DEF-5678',
    marca: 'Honda',
    modelo: 'Civic',
    ano: '2019',
    cor: 'Preto',
    donos: ['987.654.321-00'],
  },
  {
    placa: 'GHI-9012',
    marca: 'Ford',
    modelo: 'Transit',
    ano: '2021',
    cor: 'Branco',
    donos: ['12.345.678/0001-90'],
  },
  {
    placa: 'JKL3M45',
    marca: 'Volkswagen',
    modelo: 'Gol',
    ano: '2018',
    cor: 'Vermelho',
    donos: ['529.982.247-25'],
  },
  {
    placa: 'MNO-6789',
    marca: 'Chevrolet',
    modelo: 'Onix',
    ano: '2022',
    cor: 'Branco',
    donos: ['286.255.878-87'],
  },
  {
    placa: 'PQR4S56',
    marca: 'Hyundai',
    modelo: 'HB20',
    ano: '2023',
    cor: 'Azul',
    donos: ['390.533.447-05'],
  },
  {
    placa: 'STU-7890',
    marca: 'Fiat',
    modelo: 'Argo',
    ano: '2021',
    cor: 'Cinza',
    donos: ['714.602.380-01'],
  },
  {
    placa: 'VWX5Y67',
    marca: 'Jeep',
    modelo: 'Renegade',
    ano: '2020',
    cor: 'Verde',
    donos: ['861.547.023-53', '453.178.209-79'],
  },
  {
    placa: 'YZA-2345',
    marca: 'Renault',
    modelo: 'Kwid',
    ano: '2019',
    cor: 'Laranja',
    donos: ['168.995.350-09'],
  },
  {
    placa: 'BCD6E78',
    marca: 'Nissan',
    modelo: 'Kicks',
    ano: '2022',
    cor: 'Prata',
    donos: ['047.392.815-97'],
  },
  {
    placa: 'EFG-3456',
    marca: 'Toyota',
    modelo: 'Hilux',
    ano: '2021',
    cor: 'Preto',
    donos: ['27.531.864/0001-96'],
  },
  {
    placa: 'HIJ7K89',
    marca: 'Mercedes-Benz',
    modelo: 'Sprinter',
    ano: '2022',
    cor: 'Branco',
    donos: ['11.222.333/0001-81'],
  },
  {
    placa: 'KLM-4567',
    marca: 'Fiat',
    modelo: 'Fiorino',
    ano: '2020',
    cor: 'Branco',
    donos: ['11.222.333/0001-81'],
  },
  {
    placa: 'NOP8Q90',
    marca: 'Volkswagen',
    modelo: 'T-Cross',
    ano: '2023',
    cor: 'Cinza',
    donos: ['45.321.789/0001-10'],
  },
  {
    placa: 'QRS-5678',
    marca: 'Chevrolet',
    modelo: 'Tracker',
    ano: '2022',
    cor: 'Azul',
    donos: ['45.321.789/0001-10'],
  },
  {
    placa: 'TUV9W01',
    marca: 'Fiat',
    modelo: 'Strada',
    ano: '2021',
    cor: 'Vermelho',
    donos: ['60.987.432/0001-60'],
  },
  {
    placa: 'WXY-6789',
    marca: 'Honda',
    modelo: 'HR-V',
    ano: '2018',
    cor: 'Prata',
    donos: ['529.982.247-25'],
  },
  {
    placa: 'ZAB1C23',
    marca: 'Volkswagen',
    modelo: 'Saveiro',
    ano: '2017',
    cor: 'Branco',
    donos: ['27.531.864/0001-96'],
  },
];

const PECAS = [
  { nome: 'Filtro de Óleo', qtdEstoque: 50, valorUn: 35.9 },
  { nome: 'Pastilha de Freio', qtdEstoque: 30, valorUn: 89.9 },
  { nome: 'Correia Dentada', qtdEstoque: 20, valorUn: 149.9 },
  { nome: 'Filtro de Ar', qtdEstoque: 40, valorUn: 42.5 },
  { nome: 'Filtro de Combustível', qtdEstoque: 35, valorUn: 38.0 },
  { nome: 'Filtro de Cabine', qtdEstoque: 45, valorUn: 29.9 },
  { nome: 'Disco de Freio', qtdEstoque: 16, valorUn: 219.9 },
  { nome: 'Vela de Ignição', qtdEstoque: 80, valorUn: 24.9 },
  { nome: 'Amortecedor Dianteiro', qtdEstoque: 8, valorUn: 389.0 },
  { nome: 'Bateria 60Ah', qtdEstoque: 6, valorUn: 459.0 },
  { nome: 'Lâmpada H4', qtdEstoque: 60, valorUn: 19.9 },
  { nome: 'Palheta do Limpador', qtdEstoque: 25, valorUn: 44.9 },
  { nome: 'Kit Embreagem', qtdEstoque: 5, valorUn: 899.0 },
  { nome: 'Bomba d’Água', qtdEstoque: 7, valorUn: 279.0 },
  { nome: 'Terminal de Direção', qtdEstoque: 3, valorUn: 119.9 },
];

const INSUMOS = [
  { nome: 'Óleo Motor 5W30', qtdEstoque: 100, valorUn: 28.5 },
  { nome: 'Fluido de Freio DOT4', qtdEstoque: 40, valorUn: 22.0 },
  { nome: 'Óleo Motor 15W40', qtdEstoque: 80, valorUn: 24.9 },
  { nome: 'Aditivo de Radiador', qtdEstoque: 30, valorUn: 32.0 },
  { nome: 'Fluido de Direção Hidráulica', qtdEstoque: 20, valorUn: 27.5 },
  { nome: 'Graxa Multiuso', qtdEstoque: 15, valorUn: 18.9 },
  { nome: 'Desengraxante', qtdEstoque: 25, valorUn: 21.0 },
  { nome: 'Limpa Contato', qtdEstoque: 18, valorUn: 26.9 },
  { nome: 'Gás Refrigerante R134a', qtdEstoque: 4, valorUn: 95.0 },
  { nome: 'Estopa (pacote)', qtdEstoque: 50, valorUn: 9.9 },
];

const SERVICOS = [
  { descricao: 'Troca de Óleo', valor: 80.0 },
  { descricao: 'Alinhamento e Balanceamento', valor: 120.0 },
  { descricao: 'Revisão Completa', valor: 350.0 },
  { descricao: 'Troca de Pastilhas de Freio', valor: 110.0 },
  { descricao: 'Troca de Correia Dentada', valor: 280.0 },
  { descricao: 'Diagnóstico Eletrônico (scanner)', valor: 150.0 },
  { descricao: 'Higienização do Ar-Condicionado', valor: 130.0 },
  { descricao: 'Carga de Gás do Ar-Condicionado', valor: 220.0 },
  { descricao: 'Troca de Amortecedores (par)', valor: 260.0 },
  { descricao: 'Troca de Embreagem', valor: 450.0 },
  { descricao: 'Troca de Bateria', valor: 40.0 },
  { descricao: 'Sangria do Sistema de Freio', valor: 90.0 },
];

// Fluxo feliz da OS (espelha TRANSICOES_VALIDAS do domínio). `rejeitada`
// sai de `aguardando_aprovacao`.
const FLUXO: Status[] = [
  Status.recebida,
  Status.em_diagnostico,
  Status.aguardando_aprovacao,
  Status.em_execucao,
  Status.finalizada,
  Status.entregue,
];

function caminhoAte(status: Status): Status[] {
  if (status === Status.rejeitada) {
    return [
      ...FLUXO.slice(0, FLUXO.indexOf(Status.aguardando_aprovacao) + 1),
      Status.rejeitada,
    ];
  }
  return FLUXO.slice(0, FLUXO.indexOf(status) + 1);
}

// Uma OS por veículo novo, cobrindo todos os status. `diasAtras` define a
// abertura; cada transição seguinte acontece `horasEntreEtapas` depois, o que
// alimenta a listagem por prioridade e a métrica de tempo médio.
type OrdemSeed = {
  placa: string;
  mecanico: string;
  status: Status;
  diasAtras: number;
  horasEntreEtapas: number;
  servicos: { descricao: string; qtd: number }[];
  pecas: { nome: string; qtd: number }[];
  insumos: { nome: string; qtd: number }[];
};

const ORDENS: OrdemSeed[] = [
  {
    placa: 'JKL3M45',
    mecanico: 'ana.mecanica@oficina.com',
    status: Status.recebida,
    diasAtras: 0,
    horasEntreEtapas: 1,
    servicos: [],
    pecas: [],
    insumos: [],
  },
  {
    placa: 'MNO-6789',
    mecanico: 'rafael.mecanico@oficina.com',
    status: Status.recebida,
    diasAtras: 1,
    horasEntreEtapas: 1,
    servicos: [],
    pecas: [],
    insumos: [],
  },
  {
    placa: 'PQR4S56',
    mecanico: 'joao.mecanico@oficina.com',
    status: Status.em_diagnostico,
    diasAtras: 1,
    horasEntreEtapas: 2,
    servicos: [{ descricao: 'Diagnóstico Eletrônico (scanner)', qtd: 1 }],
    pecas: [],
    insumos: [],
  },
  {
    placa: 'STU-7890',
    mecanico: 'carlos.mecanico@oficina.com',
    status: Status.em_diagnostico,
    diasAtras: 2,
    horasEntreEtapas: 3,
    servicos: [{ descricao: 'Troca de Pastilhas de Freio', qtd: 1 }],
    pecas: [{ nome: 'Pastilha de Freio', qtd: 1 }],
    insumos: [],
  },
  {
    placa: 'VWX5Y67',
    mecanico: 'juliana.mecanica@oficina.com',
    status: Status.aguardando_aprovacao,
    diasAtras: 2,
    horasEntreEtapas: 4,
    servicos: [{ descricao: 'Troca de Correia Dentada', qtd: 1 }],
    pecas: [
      { nome: 'Correia Dentada', qtd: 1 },
      { nome: 'Bomba d’Água', qtd: 1 },
    ],
    insumos: [{ nome: 'Aditivo de Radiador', qtd: 2 }],
  },
  {
    placa: 'YZA-2345',
    mecanico: 'ana.mecanica@oficina.com',
    status: Status.aguardando_aprovacao,
    diasAtras: 3,
    horasEntreEtapas: 5,
    servicos: [{ descricao: 'Troca de Embreagem', qtd: 1 }],
    pecas: [{ nome: 'Kit Embreagem', qtd: 1 }],
    insumos: [{ nome: 'Graxa Multiuso', qtd: 1 }],
  },
  {
    placa: 'BCD6E78',
    mecanico: 'rafael.mecanico@oficina.com',
    status: Status.em_execucao,
    diasAtras: 4,
    horasEntreEtapas: 6,
    servicos: [
      { descricao: 'Higienização do Ar-Condicionado', qtd: 1 },
      { descricao: 'Carga de Gás do Ar-Condicionado', qtd: 1 },
    ],
    pecas: [{ nome: 'Filtro de Cabine', qtd: 1 }],
    insumos: [{ nome: 'Gás Refrigerante R134a', qtd: 1 }],
  },
  {
    placa: 'EFG-3456',
    mecanico: 'joao.mecanico@oficina.com',
    status: Status.em_execucao,
    diasAtras: 5,
    horasEntreEtapas: 8,
    servicos: [{ descricao: 'Revisão Completa', qtd: 1 }],
    pecas: [
      { nome: 'Filtro de Óleo', qtd: 1 },
      { nome: 'Filtro de Ar', qtd: 1 },
      { nome: 'Filtro de Combustível', qtd: 1 },
    ],
    insumos: [{ nome: 'Óleo Motor 15W40', qtd: 7 }],
  },
  {
    placa: 'HIJ7K89',
    mecanico: 'carlos.mecanico@oficina.com',
    status: Status.finalizada,
    diasAtras: 7,
    horasEntreEtapas: 10,
    servicos: [
      { descricao: 'Troca de Amortecedores (par)', qtd: 1 },
      { descricao: 'Alinhamento e Balanceamento', qtd: 1 },
    ],
    pecas: [{ nome: 'Amortecedor Dianteiro', qtd: 2 }],
    insumos: [],
  },
  {
    placa: 'KLM-4567',
    mecanico: 'juliana.mecanica@oficina.com',
    status: Status.finalizada,
    diasAtras: 8,
    horasEntreEtapas: 6,
    servicos: [{ descricao: 'Troca de Óleo', qtd: 1 }],
    pecas: [{ nome: 'Filtro de Óleo', qtd: 1 }],
    insumos: [{ nome: 'Óleo Motor 5W30', qtd: 4 }],
  },
  {
    placa: 'NOP8Q90',
    mecanico: 'ana.mecanica@oficina.com',
    status: Status.entregue,
    diasAtras: 12,
    horasEntreEtapas: 12,
    servicos: [{ descricao: 'Troca de Bateria', qtd: 1 }],
    pecas: [{ nome: 'Bateria 60Ah', qtd: 1 }],
    insumos: [{ nome: 'Limpa Contato', qtd: 1 }],
  },
  {
    placa: 'QRS-5678',
    mecanico: 'rafael.mecanico@oficina.com',
    status: Status.entregue,
    diasAtras: 15,
    horasEntreEtapas: 9,
    servicos: [
      { descricao: 'Troca de Pastilhas de Freio', qtd: 1 },
      { descricao: 'Sangria do Sistema de Freio', qtd: 1 },
    ],
    pecas: [
      { nome: 'Pastilha de Freio', qtd: 1 },
      { nome: 'Disco de Freio', qtd: 2 },
    ],
    insumos: [{ nome: 'Fluido de Freio DOT4', qtd: 1 }],
  },
  {
    placa: 'TUV9W01',
    mecanico: 'joao.mecanico@oficina.com',
    status: Status.entregue,
    diasAtras: 20,
    horasEntreEtapas: 7,
    servicos: [
      { descricao: 'Troca de Óleo', qtd: 1 },
      { descricao: 'Alinhamento e Balanceamento', qtd: 1 },
    ],
    pecas: [
      { nome: 'Filtro de Óleo', qtd: 1 },
      { nome: 'Palheta do Limpador', qtd: 2 },
    ],
    insumos: [{ nome: 'Óleo Motor 5W30', qtd: 4 }],
  },
  {
    placa: 'WXY-6789',
    mecanico: 'carlos.mecanico@oficina.com',
    status: Status.rejeitada,
    diasAtras: 6,
    horasEntreEtapas: 5,
    servicos: [{ descricao: 'Troca de Embreagem', qtd: 1 }],
    pecas: [{ nome: 'Kit Embreagem', qtd: 1 }],
    insumos: [],
  },
  {
    placa: 'ZAB1C23',
    mecanico: 'juliana.mecanica@oficina.com',
    status: Status.rejeitada,
    diasAtras: 9,
    horasEntreEtapas: 4,
    servicos: [{ descricao: 'Revisão Completa', qtd: 1 }],
    pecas: [{ nome: 'Vela de Ignição', qtd: 4 }],
    insumos: [{ nome: 'Óleo Motor 5W30', qtd: 4 }],
  },
];

// ── Massa gerada ──────────────────────────────────────────────────────────
// Os registros acima são curados (e referenciados por testes). Abaixo vem o
// volume para demonstração, gerado por um PRNG com semente fixa: cada
// execução produz exatamente os mesmos documentos, placas e e-mails, então os
// upserts por chave natural continuam idempotentes. Sem faker de propósito —
// o seed roda no container de produção, onde devDependencies não existem.

function mulberry32(semente: number) {
  return () => {
    semente = (semente + 0x6d2b79f5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(66);
const entre = (min: number, max: number) =>
  min + Math.floor(rand() * (max - min + 1));
const escolher = <T>(lista: readonly T[]): T =>
  lista[Math.floor(rand() * lista.length)];
const amostra = <T>(lista: readonly T[], n: number): T[] => {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, n);
};
const pesado = <T>(opcoes: [T, number][]): T => {
  let r = rand() * opcoes.reduce((t, [, peso]) => t + peso, 0);
  for (const [valor, peso] of opcoes) {
    if ((r -= peso) < 0) return valor;
  }
  return opcoes[opcoes.length - 1][0];
};
const semAcento = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const dv = (numeros: number[], pesos: number[]) => {
  const resto = numeros.reduce((t, n, i) => t + n * pesos[i], 0) % 11;
  return resto < 2 ? 0 : 11 - resto;
};
function gerarCpf(): string {
  const d = Array.from({ length: 9 }, () => entre(0, 9));
  d.push(dv(d, [10, 9, 8, 7, 6, 5, 4, 3, 2]));
  d.push(dv(d, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]));
  const s = d.join('');
  return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-${s.slice(9)}`;
}
function gerarCnpj(): string {
  const d = [...Array.from({ length: 8 }, () => entre(0, 9)), 0, 0, 0, 1];
  d.push(dv(d, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
  d.push(dv(d, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
  const s = d.join('');
  return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5, 8)}/${s.slice(8, 12)}-${s.slice(12)}`;
}

const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function gerarPlaca(): string {
  const l = () => escolher([...LETRAS]);
  const n = () => entre(0, 9);
  // ~60% Mercosul (AAA1A23), o resto no padrão antigo (AAA-1234).
  return rand() < 0.6
    ? `${l()}${l()}${l()}${n()}${l()}${n()}${n()}`
    : `${l()}${l()}${l()}-${n()}${n()}${n()}${n()}`;
}

const PRIMEIROS_NOMES = [
  'Ana',
  'Bruno',
  'Carla',
  'Daniel',
  'Eduarda',
  'Felipe',
  'Gabriela',
  'Henrique',
  'Isabela',
  'José',
  'Karina',
  'Leonardo',
  'Mariana',
  'Nicolas',
  'Olívia',
  'Paulo',
  'Renata',
  'Samuel',
  'Tatiane',
  'Vinícius',
  'Aline',
  'André',
  'Bianca',
  'Caio',
  'Débora',
  'Eduardo',
  'Fábio',
  'Giovana',
  'Igor',
  'Jéssica',
  'Kauã',
  'Letícia',
  'Matheus',
  'Natália',
  'Otávio',
  'Priscila',
  'Ricardo',
  'Sabrina',
  'Túlio',
  'Vanessa',
  'Wagner',
  'Yasmin',
];
const SOBRENOMES = [
  'Silva',
  'Santos',
  'Oliveira',
  'Souza',
  'Rodrigues',
  'Ferreira',
  'Alves',
  'Pereira',
  'Lima',
  'Gomes',
  'Costa',
  'Ribeiro',
  'Martins',
  'Carvalho',
  'Almeida',
  'Lopes',
  'Soares',
  'Fernandes',
  'Vieira',
  'Barbosa',
  'Rocha',
  'Dias',
  'Nascimento',
  'Andrade',
  'Moreira',
  'Nunes',
  'Marques',
  'Machado',
  'Mendes',
  'Freitas',
  'Cardoso',
  'Ramos',
  'Teixeira',
  'Correia',
  'Araújo',
];
const EMPRESA_PREFIXO = [
  'Transportadora',
  'Distribuidora',
  'Locadora',
  'Construtora',
  'Mercado',
  'Logística',
  'Comercial',
  'Agropecuária',
  'Farmácia',
  'Auto Escola',
];
const EMPRESA_NOME = [
  'Horizonte',
  'Boa Vista',
  'Estrela',
  'Bandeirantes',
  'Litoral',
  'Serra Azul',
  'Primavera',
  'Aliança',
  'Progresso',
  'Sol Nascente',
  'Vale Verde',
  'Atlântico',
  'Paulista',
  'Cerrado',
  'Pioneira',
  'União',
  'Rota Sul',
  'Nova Era',
];
const EMPRESA_SUFIXO = ['Ltda', 'S.A.', 'ME', 'EIRELI', 'Ltda'];
const DDDS = [
  '11',
  '11',
  '11',
  '12',
  '13',
  '19',
  '21',
  '31',
  '41',
  '47',
  '51',
  '61',
  '71',
  '81',
];
const telefone = (fixo = false) =>
  fixo
    ? `(${escolher(DDDS)}) ${entre(2000, 3999)}-${entre(1000, 9999)}`
    : `(${escolher(DDDS)}) 9${entre(1000, 9999)}-${entre(1000, 9999)}`;

const MODELOS: [string, string][] = [
  ['Volkswagen', 'Gol'],
  ['Volkswagen', 'Polo'],
  ['Volkswagen', 'Virtus'],
  ['Volkswagen', 'T-Cross'],
  ['Volkswagen', 'Nivus'],
  ['Volkswagen', 'Amarok'],
  ['Chevrolet', 'Onix'],
  ['Chevrolet', 'Onix Plus'],
  ['Chevrolet', 'Tracker'],
  ['Chevrolet', 'S10'],
  ['Chevrolet', 'Spin'],
  ['Fiat', 'Argo'],
  ['Fiat', 'Mobi'],
  ['Fiat', 'Cronos'],
  ['Fiat', 'Strada'],
  ['Fiat', 'Toro'],
  ['Fiat', 'Pulse'],
  ['Fiat', 'Fiorino'],
  ['Hyundai', 'HB20'],
  ['Hyundai', 'HB20S'],
  ['Hyundai', 'Creta'],
  ['Toyota', 'Corolla'],
  ['Toyota', 'Corolla Cross'],
  ['Toyota', 'Yaris'],
  ['Toyota', 'Hilux'],
  ['Toyota', 'SW4'],
  ['Honda', 'Civic'],
  ['Honda', 'City'],
  ['Honda', 'HR-V'],
  ['Renault', 'Kwid'],
  ['Renault', 'Sandero'],
  ['Renault', 'Duster'],
  ['Renault', 'Master'],
  ['Jeep', 'Renegade'],
  ['Jeep', 'Compass'],
  ['Nissan', 'Kicks'],
  ['Nissan', 'Versa'],
  ['Nissan', 'Frontier'],
  ['Ford', 'Ranger'],
  ['Ford', 'Transit'],
  ['Mercedes-Benz', 'Sprinter'],
  ['Peugeot', '208'],
  ['Citroën', 'C3'],
  ['Mitsubishi', 'L200'],
  ['BYD', 'Dolphin'],
];
const MODELOS_FROTA = MODELOS.filter(([, m]) =>
  [
    'Strada',
    'Fiorino',
    'Saveiro',
    'S10',
    'Hilux',
    'Ranger',
    'Transit',
    'Sprinter',
    'Master',
    'Toro',
    'Frontier',
    'L200',
    'Amarok',
    'Spin',
  ].includes(m),
);
const CORES = [
  'Branco',
  'Branco',
  'Prata',
  'Prata',
  'Preto',
  'Preto',
  'Cinza',
  'Vermelho',
  'Azul',
  'Verde',
  'Bege',
  'Marrom',
];

// Catálogo extra (nomes reais, preços de referência de mercado).
PECAS.push(
  { nome: 'Pastilha de Freio Traseira', qtdEstoque: 24, valorUn: 79.9 },
  { nome: 'Lona de Freio', qtdEstoque: 18, valorUn: 69.9 },
  { nome: 'Cilindro Mestre de Freio', qtdEstoque: 4, valorUn: 329.0 },
  { nome: 'Flexível de Freio', qtdEstoque: 20, valorUn: 34.9 },
  { nome: 'Amortecedor Traseiro', qtdEstoque: 8, valorUn: 299.0 },
  { nome: 'Kit Batente e Coifa', qtdEstoque: 14, valorUn: 59.9 },
  { nome: 'Bandeja de Suspensão', qtdEstoque: 6, valorUn: 249.0 },
  { nome: 'Pivô de Suspensão', qtdEstoque: 12, valorUn: 89.9 },
  { nome: 'Bucha da Bandeja', qtdEstoque: 30, valorUn: 24.9 },
  { nome: 'Barra Axial', qtdEstoque: 10, valorUn: 99.9 },
  { nome: 'Rolamento de Roda', qtdEstoque: 16, valorUn: 139.0 },
  { nome: 'Homocinética', qtdEstoque: 6, valorUn: 279.0 },
  { nome: 'Coifa da Homocinética', qtdEstoque: 20, valorUn: 39.9 },
  { nome: 'Tensor da Correia', qtdEstoque: 12, valorUn: 159.0 },
  { nome: 'Correia Poly-V', qtdEstoque: 22, valorUn: 64.9 },
  { nome: 'Kit Correia Dentada + Tensor', qtdEstoque: 8, valorUn: 349.0 },
  { nome: 'Radiador', qtdEstoque: 3, valorUn: 589.0 },
  { nome: 'Válvula Termostática', qtdEstoque: 10, valorUn: 89.0 },
  { nome: 'Mangueira do Radiador', qtdEstoque: 18, valorUn: 54.9 },
  { nome: 'Reservatório de Expansão', qtdEstoque: 7, valorUn: 119.0 },
  { nome: 'Bobina de Ignição', qtdEstoque: 9, valorUn: 229.0 },
  { nome: 'Cabo de Vela (jogo)', qtdEstoque: 11, valorUn: 129.0 },
  { nome: 'Sensor de Oxigênio (sonda lambda)', qtdEstoque: 5, valorUn: 319.0 },
  { nome: 'Sensor de Temperatura', qtdEstoque: 14, valorUn: 59.9 },
  { nome: 'Bico Injetor', qtdEstoque: 12, valorUn: 189.0 },
  { nome: 'Bomba de Combustível', qtdEstoque: 5, valorUn: 379.0 },
  { nome: 'Alternador', qtdEstoque: 2, valorUn: 899.0 },
  { nome: 'Motor de Partida', qtdEstoque: 2, valorUn: 749.0 },
  { nome: 'Bateria 45Ah', qtdEstoque: 8, valorUn: 399.0 },
  { nome: 'Bateria 70Ah', qtdEstoque: 4, valorUn: 549.0 },
  { nome: 'Lâmpada H7', qtdEstoque: 50, valorUn: 22.9 },
  { nome: 'Lâmpada de Lanterna', qtdEstoque: 80, valorUn: 6.9 },
  { nome: 'Junta do Cabeçote', qtdEstoque: 6, valorUn: 189.0 },
  { nome: 'Junta da Tampa de Válvulas', qtdEstoque: 10, valorUn: 49.9 },
  { nome: 'Coxim do Motor', qtdEstoque: 8, valorUn: 179.0 },
  { nome: 'Compressor do Ar-Condicionado', qtdEstoque: 1, valorUn: 1890.0 },
  { nome: 'Filtro Secador do Ar-Condicionado', qtdEstoque: 6, valorUn: 119.0 },
  { nome: 'Pneu Aro 14', qtdEstoque: 16, valorUn: 389.0 },
  { nome: 'Pneu Aro 15', qtdEstoque: 20, valorUn: 449.0 },
  { nome: 'Pneu Aro 16', qtdEstoque: 12, valorUn: 539.0 },
  { nome: 'Escapamento Intermediário', qtdEstoque: 4, valorUn: 259.0 },
  { nome: 'Silencioso Traseiro', qtdEstoque: 4, valorUn: 289.0 },
);

INSUMOS.push(
  { nome: 'Óleo Motor 0W20', qtdEstoque: 60, valorUn: 39.9 },
  { nome: 'Óleo Motor 5W40', qtdEstoque: 70, valorUn: 34.9 },
  { nome: 'Óleo Diesel 15W40 (balde 20L)', qtdEstoque: 6, valorUn: 489.0 },
  { nome: 'Óleo de Câmbio 75W90', qtdEstoque: 25, valorUn: 49.9 },
  { nome: 'Fluido ATF', qtdEstoque: 30, valorUn: 44.9 },
  { nome: 'Fluido de Freio DOT5.1', qtdEstoque: 12, valorUn: 42.0 },
  { nome: 'Água Desmineralizada', qtdEstoque: 40, valorUn: 8.9 },
  { nome: 'Limpa Bicos', qtdEstoque: 24, valorUn: 34.9 },
  { nome: 'Descarbonizante TBI', qtdEstoque: 20, valorUn: 39.9 },
  {
    nome: 'Spray Higienizador de Ar-Condicionado',
    qtdEstoque: 30,
    valorUn: 29.9,
  },
  { nome: 'Óleo PAG para Compressor', qtdEstoque: 8, valorUn: 69.9 },
  { nome: 'Desengripante', qtdEstoque: 26, valorUn: 19.9 },
  { nome: 'Cola de Junta (silicone)', qtdEstoque: 22, valorUn: 24.9 },
  { nome: 'Fita Isolante', qtdEstoque: 60, valorUn: 6.5 },
  { nome: 'Abraçadeira Plástica (pacote)', qtdEstoque: 45, valorUn: 12.9 },
  { nome: 'Lixa d’Água', qtdEstoque: 100, valorUn: 3.5 },
  { nome: 'Luva Nitrílica (caixa)', qtdEstoque: 15, valorUn: 49.9 },
  { nome: 'Pasta de Polimento', qtdEstoque: 10, valorUn: 59.9 },
  { nome: 'Arla 32 (galão)', qtdEstoque: 12, valorUn: 79.9 },
  { nome: 'Gás Refrigerante R1234yf', qtdEstoque: 2, valorUn: 390.0 },
);

SERVICOS.push(
  { descricao: 'Troca de Filtros (ar, combustível e cabine)', valor: 90.0 },
  { descricao: 'Troca de Discos e Pastilhas', valor: 180.0 },
  { descricao: 'Revisão do Sistema de Freios', valor: 140.0 },
  { descricao: 'Troca de Fluido de Freio', valor: 100.0 },
  { descricao: 'Revisão de Suspensão', valor: 160.0 },
  { descricao: 'Troca de Bandeja', valor: 150.0 },
  { descricao: 'Troca de Pivô', valor: 110.0 },
  { descricao: 'Troca de Rolamento de Roda', valor: 130.0 },
  { descricao: 'Troca de Homocinética', valor: 170.0 },
  { descricao: 'Geometria Completa', valor: 160.0 },
  { descricao: 'Rodízio de Pneus', valor: 60.0 },
  { descricao: 'Montagem de Pneus (jogo)', valor: 80.0 },
  { descricao: 'Limpeza de Bicos Injetores', valor: 190.0 },
  { descricao: 'Limpeza do Corpo de Borboleta (TBI)', valor: 120.0 },
  { descricao: 'Troca de Velas e Cabos', valor: 120.0 },
  { descricao: 'Troca de Bobina de Ignição', valor: 90.0 },
  { descricao: 'Troca de Bomba de Combustível', valor: 220.0 },
  { descricao: 'Revisão do Sistema de Arrefecimento', valor: 150.0 },
  { descricao: 'Troca de Radiador', valor: 240.0 },
  { descricao: 'Troca de Válvula Termostática', valor: 130.0 },
  { descricao: 'Troca da Junta do Cabeçote', valor: 780.0 },
  { descricao: 'Retífica de Cabeçote', valor: 950.0 },
  { descricao: 'Troca de Óleo do Câmbio', valor: 140.0 },
  { descricao: 'Troca de Alternador', valor: 160.0 },
  { descricao: 'Troca de Motor de Partida', valor: 160.0 },
  { descricao: 'Revisão Elétrica', valor: 180.0 },
  { descricao: 'Troca de Compressor do Ar-Condicionado', valor: 380.0 },
  { descricao: 'Reparo de Escapamento', valor: 140.0 },
  { descricao: 'Polimento de Faróis', valor: 120.0 },
  { descricao: 'Revisão de Viagem (checklist 40 itens)', valor: 190.0 },
);

// Equipe: mecânicos e atendentes extras (e-mails únicos por nome+sobrenome).
const emailsUsados = new Set(USUARIOS.map((u) => u.email));
function novoUsuario(roles: Roles, sufixo: string) {
  for (;;) {
    const nome = `${escolher(PRIMEIROS_NOMES)} ${escolher(SOBRENOMES)}`;
    const email = `${semAcento(nome).replace(' ', '.')}.${sufixo}@oficina.com`;
    if (emailsUsados.has(email)) continue;
    emailsUsados.add(email);
    USUARIOS.push({ nome, email, roles });
    return;
  }
}
for (let i = 0; i < 14; i++) novoUsuario(Roles.mecanico, 'mecanico');
for (let i = 0; i < 6; i++) novoUsuario(Roles.funcionario, 'atendimento');
novoUsuario(Roles.admin, 'gerencia');

const documentosUsados = new Set(CLIENTES.map((c) => c.numDocumento));
const placasUsadas = new Set(VEICULOS.map((v) => v.placa));
const emailsClientes = new Set<string>();
const unico = (gerar: () => string, usados: Set<string>) => {
  for (;;) {
    const valor = gerar();
    if (!usados.has(valor)) {
      usados.add(valor);
      return valor;
    }
  }
};

// Veículos gerados ficam guardados para receberem OS mais abaixo.
const PLACAS_GERADAS: string[] = [];
function novoVeiculo(donos: string[], frota: boolean) {
  const [marca, modelo] = escolher(frota ? MODELOS_FROTA : MODELOS);
  const placa = unico(gerarPlaca, placasUsadas);
  VEICULOS.push({
    placa,
    marca,
    modelo,
    ano: String(entre(frota ? 2016 : 2010, 2025)),
    cor: escolher(CORES),
    donos,
  });
  PLACAS_GERADAS.push(placa);
}

// 120 pessoas físicas: 1 carro, às vezes 2; ~5% dividem o carro com outro
// cliente (cônjuge, por exemplo).
const pessoasFisicas: string[] = [];
for (let i = 0; i < 120; i++) {
  const primeiro = escolher(PRIMEIROS_NOMES);
  const nome = `${primeiro} ${escolher(SOBRENOMES)} ${escolher(SOBRENOMES)}`;
  const numDocumento = unico(gerarCpf, documentosUsados);
  // ~80% informam e-mail (necessário para receber o orçamento).
  const email =
    rand() < 0.8
      ? unico(
          () =>
            `${semAcento(nome).split(' ').slice(0, 2).join('.')}${entre(1, 99)}@email.com`,
          emailsClientes,
        )
      : undefined;
  CLIENTES.push({
    numDocumento,
    nome,
    telefone: telefone(),
    ...(email && { email }),
    tipo: Tipo.pessoa_fisica,
  });
  pessoasFisicas.push(numDocumento);
  const coDono =
    pessoasFisicas.length > 1 && rand() < 0.05
      ? escolher(pessoasFisicas.slice(0, -1))
      : undefined;
  novoVeiculo(coDono ? [numDocumento, coDono] : [numDocumento], false);
  if (rand() < 0.25) novoVeiculo([numDocumento], false);
}

// 25 empresas com frota de 2 a 6 veículos utilitários.
for (let i = 0; i < 25; i++) {
  const nome = `${escolher(EMPRESA_PREFIXO)} ${escolher(EMPRESA_NOME)} ${escolher(EMPRESA_SUFIXO)}`;
  const numDocumento = unico(gerarCnpj, documentosUsados);
  const email = unico(
    () =>
      `frota${entre(1, 999)}@${semAcento(nome).split(' ').slice(0, 2).join('')}.com.br`,
    emailsClientes,
  );
  CLIENTES.push({
    numDocumento,
    nome,
    telefone: telefone(true),
    email,
    tipo: Tipo.pessoa_juridica,
  });
  const tamanhoFrota = entre(2, 6);
  for (let v = 0; v < tamanhoFrota; v++) novoVeiculo([numDocumento], true);
}

// OS geradas: cada veículo tem de 0 a 4 passagens pela oficina nos últimos
// 6 meses. As antigas já foram encerradas (entregues ou rejeitadas); só a
// mais recente pode estar em andamento, como numa oficina de verdade.
const MECANICOS = USUARIOS.filter((u) => u.roles === Roles.mecanico).map(
  (u) => u.email,
);
const STATUS_ATUAL: [Status, number][] = [
  [Status.recebida, 10],
  [Status.em_diagnostico, 10],
  [Status.aguardando_aprovacao, 10],
  [Status.em_execucao, 12],
  [Status.finalizada, 8],
  [Status.entregue, 40],
  [Status.rejeitada, 10],
];
const STATUS_ANTIGO: [Status, number][] = [
  [Status.entregue, 85],
  [Status.rejeitada, 15],
];
const ATIVOS: Status[] = [
  Status.recebida,
  Status.em_diagnostico,
  Status.aguardando_aprovacao,
  Status.em_execucao,
  Status.finalizada,
];

function novaOrdem(placa: string, status: Status, diasAtras: number) {
  // Recebida ainda não tem orçamento; em diagnóstico tem um esboço parcial.
  const semItens = status === Status.recebida;
  const parcial = status === Status.em_diagnostico;
  ORDENS.push({
    placa,
    mecanico: escolher(MECANICOS),
    status,
    diasAtras,
    horasEntreEtapas: entre(1, 18),
    servicos: semItens
      ? []
      : amostra(SERVICOS, parcial ? 1 : entre(1, 3)).map((s) => ({
          descricao: s.descricao,
          qtd: 1,
        })),
    pecas: semItens
      ? []
      : amostra(PECAS, parcial ? entre(0, 1) : entre(0, 4)).map((p) => ({
          nome: p.nome,
          qtd: entre(1, 4),
        })),
    insumos: semItens
      ? []
      : amostra(INSUMOS, entre(0, parcial ? 1 : 3)).map((i) => ({
          nome: i.nome,
          qtd: entre(1, 5),
        })),
  });
}

for (const placa of PLACAS_GERADAS) {
  const passagens = pesado<number>([
    [0, 15],
    [1, 40],
    [2, 25],
    [3, 13],
    [4, 7],
  ]);
  // Datas em ordem decrescente: a primeira da lista é a mais recente.
  const dias = Array.from({ length: passagens }, () => entre(0, 180)).sort(
    (a, b) => a - b,
  );
  dias.forEach((diasAtras, idx) => {
    if (idx > 0) return novaOrdem(placa, pesado(STATUS_ANTIGO), diasAtras);
    const status = pesado(STATUS_ATUAL);
    // Em andamento só faz sentido se for recente (até 2 semanas).
    novaOrdem(
      placa,
      status,
      ATIVOS.includes(status) ? Math.min(diasAtras, entre(0, 14)) : diasAtras,
    );
  });
}

const HORA_MS = 60 * 60 * 1000;
const DIA_MS = 24 * HORA_MS;

async function main() {
  console.log('Seeding...');

  // ── Usuários ────────────────────────────────────────────────────────────
  const senha = await hash(SENHA_PADRAO);
  const usuarios = new Map<string, number>();
  for (const u of USUARIOS) {
    const usuario = await prisma.usuario.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, senha },
    });
    usuarios.set(u.email, usuario.idUsuario);
  }
  console.log(`  ✓ Usuários: ${USUARIOS.length}`);

  // ── Clientes ────────────────────────────────────────────────────────────
  const clientes = new Map<
    string,
    { clienteId: string; email: string | null }
  >();
  for (const c of CLIENTES) {
    const cliente = await prisma.cliente.upsert({
      where: { numDocumento: c.numDocumento },
      update: {},
      create: c,
    });
    clientes.set(c.numDocumento, cliente);
  }
  console.log(`  ✓ Clientes: ${CLIENTES.length}`);

  // ── Veículos + vínculo Veículo ↔ Cliente ────────────────────────────────
  const veiculos = new Map<string, { veiculoId: string; clienteId: string }>();
  for (const { donos, ...v } of VEICULOS) {
    const veiculo = await prisma.veiculo.upsert({
      where: { placa: v.placa },
      update: {},
      create: v,
    });
    for (const doc of donos) {
      const { clienteId } = clientes.get(doc)!;
      await prisma.veiculoCliente.upsert({
        where: {
          veiculoId_clienteId: { veiculoId: veiculo.veiculoId, clienteId },
        },
        update: {},
        create: { veiculoId: veiculo.veiculoId, clienteId },
      });
    }
    veiculos.set(v.placa, {
      veiculoId: veiculo.veiculoId,
      clienteId: clientes.get(donos[0])!.clienteId,
    });
  }
  console.log(`  ✓ Veículos: ${VEICULOS.length} (com vínculos)`);

  // ── Catálogo: peças, insumos e serviços ─────────────────────────────────
  // Sem chave natural única no schema: casa pelo nome/descrição para que
  // rodar de novo não duplique (e não dependa de IDs sequenciais).
  const pecas = new Map<string, { pecaId: number; valorUn: number }>();
  for (const p of PECAS) {
    const peca =
      (await prisma.peca.findFirst({ where: { nome: p.nome } })) ??
      (await prisma.peca.create({ data: p }));
    pecas.set(p.nome, { pecaId: peca.pecaId, valorUn: Number(peca.valorUn) });
  }
  console.log(`  ✓ Peças: ${PECAS.length}`);

  const insumos = new Map<string, { insumoId: number; valorUn: number }>();
  for (const i of INSUMOS) {
    const insumo =
      (await prisma.insumo.findFirst({ where: { nome: i.nome } })) ??
      (await prisma.insumo.create({ data: i }));
    insumos.set(i.nome, {
      insumoId: insumo.insumoId,
      valorUn: Number(insumo.valorUn),
    });
  }
  console.log(`  ✓ Insumos: ${INSUMOS.length}`);

  const servicos = new Map<string, { servicoId: number; valor: number }>();
  for (const s of SERVICOS) {
    const servico =
      (await prisma.servico.findFirst({ where: { descricao: s.descricao } })) ??
      (await prisma.servico.create({ data: s }));
    servicos.set(s.descricao, {
      servicoId: servico.servicoId,
      valor: Number(servico.valor),
    });
  }
  console.log(`  ✓ Serviços: ${SERVICOS.length}`);

  // ── Ordens de serviço ───────────────────────────────────────────────────
  // OS não tem chave natural: só cria para veículos que ainda não tinham
  // nenhuma OS antes desta execução, o que mantém o seed idempotente sem
  // tocar no que foi criado pela API. Calculado uma vez, antes do loop,
  // porque um mesmo veículo recebe várias OS na mesma rodada.
  const comOs = new Set(
    (
      await prisma.ordemServico.findMany({
        where: {
          veiculoId: { in: [...veiculos.values()].map((v) => v.veiculoId) },
        },
        select: { veiculoId: true },
        distinct: ['veiculoId'],
      })
    ).map((o) => o.veiculoId),
  );
  const emailPorCliente = new Map(
    [...clientes.values()].map((c) => [c.clienteId, c.email]),
  );
  let criadas = 0;
  const linksAprovacao: string[] = [];
  const agora = Date.now();

  for (const o of ORDENS) {
    const { veiculoId, clienteId } = veiculos.get(o.placa)!;
    if (comOs.has(veiculoId)) continue;

    const usuarioId = usuarios.get(o.mecanico)!;
    const caminho = caminhoAte(o.status);
    const abertura =
      agora -
      o.diasAtras * DIA_MS -
      (caminho.length - 1) * o.horasEntreEtapas * HORA_MS;
    const momento = (etapa: number) =>
      new Date(abertura + etapa * o.horasEntreEtapas * HORA_MS);

    const itensServico = o.servicos.map(({ descricao, qtd }) => {
      const s = servicos.get(descricao)!;
      return { servicoId: s.servicoId, quantidade: qtd, valor: s.valor };
    });
    const itensPeca = o.pecas.map(({ nome, qtd }) => {
      const p = pecas.get(nome)!;
      return { pecaId: p.pecaId, qtd, valor: p.valorUn };
    });
    const itensInsumo = o.insumos.map(({ nome, qtd }) => {
      const i = insumos.get(nome)!;
      return { insumoId: i.insumoId, qtdConsumida: qtd, valor: i.valorUn };
    });
    const valorFinal =
      itensServico.reduce((t, i) => t + i.valor * i.quantidade, 0) +
      itensPeca.reduce((t, i) => t + i.valor * i.qtd, 0) +
      itensInsumo.reduce((t, i) => t + i.valor * i.qtdConsumida, 0);

    const os = await prisma.ordemServico.create({
      data: {
        usuarioId,
        clienteId,
        veiculoId,
        status: o.status,
        valorFinal: Math.round(valorFinal * 100) / 100,
        criadoEm: momento(0),
        atualizadoEm: momento(caminho.length - 1),
        servicosRealizados: { create: itensServico },
        pecasUtilizadas: { create: itensPeca },
        insumosConsumidos: { create: itensInsumo },
        historicoStatus: {
          create: caminho.map((statusNovo, etapa) => ({
            statusAnterior: etapa === 0 ? null : caminho[etapa - 1],
            statusNovo,
            usuarioId,
            criadoEm: momento(etapa),
          })),
        },
      },
    });

    // OS aguardando aprovação ganham um token válido, como faria o envio do
    // orçamento, para dar para demonstrar o aprovar/rejeitar pelo link.
    const emailCliente = emailPorCliente.get(clienteId);
    if (o.status === Status.aguardando_aprovacao && emailCliente) {
      const token = randomUUID();
      await prisma.tokenAprovacao.create({
        data: {
          token,
          ordemServicoId: os.osId,
          emailCliente,
          expiresAt: new Date(agora + 7 * DIA_MS),
        },
      });
      linksAprovacao.push(
        `${o.placa}: /aprovacao/confirmar?token=${token}&acao=aprovar`,
      );
    }
    criadas++;
  }
  console.log(
    `  ✓ Ordens de serviço: ${criadas} criadas (${ORDENS.length - criadas} já existiam)`,
  );
  if (linksAprovacao.length) {
    console.log(
      `  ✓ Links de aprovação válidos por 7 dias: ${linksAprovacao.length}`,
    );
    for (const link of linksAprovacao.slice(0, 3)) console.log(`    ↳ ${link}`);
  }

  console.log('\nSeed concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
