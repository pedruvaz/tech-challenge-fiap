import { Prisma, PrismaClient, Roles, Status, Tipo } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { isValidCpf } from '../../src/shared/domain/documento';

export const SENHA_PADRAO = 'senha123';

const digitoVerificador = (numeros: number[], pesos: number[]): number => {
  const soma = numeros.reduce((acc, num, i) => acc + num * pesos[i], 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
};

/**
 * Gera um CPF que passa no validador do proprio projeto. As fixtures entram
 * direto pelo Prisma, mas a consulta publica compara documento e alguns
 * endpoints revalidam — gerar invalido daria um erro dificil de ler.
 */
export function gerarCpf(): string {
  const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const dv1 = digitoVerificador(base, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const dv2 = digitoVerificador(
    [...base, dv1],
    [11, 10, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  const n = [...base, dv1, dv2].join('');
  const cpf =
    n.slice(0, 3) +
    '.' +
    n.slice(3, 6) +
    '.' +
    n.slice(6, 9) +
    '-' +
    n.slice(9);
  // Documentos com todos os digitos iguais sao rejeitados. E raro, mas um
  // teste que falha uma vez em cem milhoes e pior que uma recursao de uma linha.
  return isValidCpf(cpf) ? cpf : gerarCpf();
}

let contador = 0;
const sufixo = (): string => {
  contador += 1;
  return Date.now().toString(36) + String(contador);
};

const letras = (n: number): string =>
  Array.from({ length: n }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26)),
  ).join('');

export const gerarPlaca = (): string =>
  letras(3) + '-' + String(Math.floor(1000 + Math.random() * 9000));

export const gerarEmail = (prefixo = 'fixture'): string =>
  prefixo + '-' + sufixo() + '@e2e.test';

/**
 * Cria dados proprios e limpa o que criou.
 *
 * A suite antiga depende do seed (joao.mecanico@oficina.com, placa ABC-1234)
 * com `!` — muda o seed, quebra com null-deref. Aqui cada suite e dona dos
 * seus dados. De proposito nao ha truncate global: isso apagaria o seed de
 * que a suite antiga ainda depende.
 */
export class Fixtures {
  private readonly usuarios: number[] = [];
  private readonly clientes: string[] = [];
  private readonly veiculos: string[] = [];
  private readonly ordens: string[] = [];
  private readonly pecas: number[] = [];
  private readonly insumos: number[] = [];
  private readonly servicos: number[] = [];

  constructor(private readonly prisma: PrismaClient) {}

  async criarUsuario(
    overrides: { roles?: Roles; senha?: string } = {},
  ): Promise<{ idUsuario: number; email: string; senha: string }> {
    const senha = overrides.senha ?? SENHA_PADRAO;
    const email = gerarEmail('user');
    const usuario = await this.prisma.usuario.create({
      data: {
        nome: 'Usuario E2E',
        email,
        senha: await bcrypt.hash(senha, 10),
        roles: overrides.roles ?? Roles.mecanico,
      },
    });
    this.usuarios.push(usuario.idUsuario);
    return { idUsuario: usuario.idUsuario, email, senha };
  }

  async criarCliente(overrides: { email?: string | null } = {}): Promise<{
    clienteId: string;
    numDocumento: string;
    email: string | null;
  }> {
    const email =
      overrides.email === undefined ? gerarEmail('cliente') : overrides.email;
    const numDocumento = gerarCpf();
    const cliente = await this.prisma.cliente.create({
      data: {
        nome: 'Cliente E2E',
        numDocumento,
        telefone: '11999998888',
        tipo: Tipo.pessoa_fisica,
        email,
      },
    });
    this.clientes.push(cliente.clienteId);
    return { clienteId: cliente.clienteId, numDocumento, email };
  }

  async criarVeiculo(clienteId: string): Promise<string> {
    const veiculo = await this.prisma.veiculo.create({
      data: {
        placa: gerarPlaca(),
        marca: 'Fiat',
        modelo: 'Uno',
        ano: '2020',
        cor: 'Branco',
        proprietarios: { create: { clienteId } },
      },
    });
    this.veiculos.push(veiculo.veiculoId);
    return veiculo.veiculoId;
  }

  async criarPeca(qtdEstoque = 10, valorUn = 100): Promise<number> {
    const peca = await this.prisma.peca.create({
      data: {
        nome: 'Peca E2E ' + sufixo(),
        qtdEstoque,
        valorUn: new Prisma.Decimal(valorUn),
      },
    });
    this.pecas.push(peca.pecaId);
    return peca.pecaId;
  }

  async criarInsumo(qtdEstoque = 10, valorUn = 20): Promise<number> {
    const insumo = await this.prisma.insumo.create({
      data: {
        nome: 'Insumo E2E ' + sufixo(),
        qtdEstoque,
        valorUn: new Prisma.Decimal(valorUn),
      },
    });
    this.insumos.push(insumo.insumoId);
    return insumo.insumoId;
  }

  async criarServico(valor = 250): Promise<number> {
    const servico = await this.prisma.servico.create({
      data: {
        descricao: 'Servico E2E ' + sufixo(),
        valor: new Prisma.Decimal(valor),
      },
    });
    this.servicos.push(servico.servicoId);
    return servico.servicoId;
  }

  async criarOrdemServico(params: {
    usuarioId: number;
    clienteId: string;
    veiculoId: string;
    status?: Status;
    valorFinal?: number;
  }): Promise<string> {
    const os = await this.prisma.ordemServico.create({
      data: {
        usuarioId: params.usuarioId,
        clienteId: params.clienteId,
        veiculoId: params.veiculoId,
        status: params.status ?? Status.recebida,
        valorFinal: new Prisma.Decimal(params.valorFinal ?? 0),
      },
    });
    this.ordens.push(os.osId);
    return os.osId;
  }

  /** Cenario minimo completo: mecanico, cliente com e-mail, veiculo e OS. */
  async cenarioBase(status: Status = Status.recebida): Promise<{
    usuarioId: number;
    email: string;
    senha: string;
    clienteId: string;
    numDocumento: string;
    emailCliente: string | null;
    veiculoId: string;
    osId: string;
  }> {
    const usuario = await this.criarUsuario();
    const cliente = await this.criarCliente();
    const veiculoId = await this.criarVeiculo(cliente.clienteId);
    const osId = await this.criarOrdemServico({
      usuarioId: usuario.idUsuario,
      clienteId: cliente.clienteId,
      veiculoId,
      status,
    });
    return {
      usuarioId: usuario.idUsuario,
      email: usuario.email,
      senha: usuario.senha,
      clienteId: cliente.clienteId,
      numDocumento: cliente.numDocumento,
      emailCliente: cliente.email,
      veiculoId,
      osId,
    };
  }

  /** Remove o que esta instancia criou, na ordem inversa das FKs. */
  async limpar(): Promise<void> {
    const dasOrdens = { osId: { in: this.ordens } };

    await this.prisma.tokenAprovacao.deleteMany({
      where: { ordemServicoId: { in: this.ordens } },
    });
    await this.prisma.historicoStatusOrdemServico.deleteMany({
      where: dasOrdens,
    });
    await this.prisma.pecaUtilizada.deleteMany({ where: dasOrdens });
    await this.prisma.insumoConsumido.deleteMany({ where: dasOrdens });
    await this.prisma.servicoRealizado.deleteMany({ where: dasOrdens });
    await this.prisma.ordemServico.deleteMany({ where: dasOrdens });

    await this.prisma.veiculoCliente.deleteMany({
      where: { veiculoId: { in: this.veiculos } },
    });
    await this.prisma.veiculo.deleteMany({
      where: { veiculoId: { in: this.veiculos } },
    });
    await this.prisma.cliente.deleteMany({
      where: { clienteId: { in: this.clientes } },
    });

    await this.prisma.peca.deleteMany({
      where: { pecaId: { in: this.pecas } },
    });
    await this.prisma.insumo.deleteMany({
      where: { insumoId: { in: this.insumos } },
    });
    await this.prisma.servico.deleteMany({
      where: { servicoId: { in: this.servicos } },
    });
    await this.prisma.usuario.deleteMany({
      where: { idUsuario: { in: this.usuarios } },
    });

    for (const lista of [
      this.ordens,
      this.veiculos,
      this.clientes,
      this.pecas,
      this.insumos,
      this.servicos,
      this.usuarios,
    ]) {
      lista.length = 0;
    }
  }
}
