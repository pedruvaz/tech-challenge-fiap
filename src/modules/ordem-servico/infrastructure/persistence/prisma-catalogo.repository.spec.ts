// Adaptadores de leitura do catálogo usados pelo agregado de OS. Todos leem
// através do PrismaTransactionContext para participar da transação corrente.
import { PrismaTransactionContext } from './prisma-transaction-context';
import { PrismaClienteRepository } from './prisma-cliente.repository';
import { PrismaInsumoRepository } from './prisma-insumo.repository';
import { PrismaMecanicoRepository } from './prisma-mecanico.repository';
import { PrismaPecaRepository } from './prisma-peca.repository';
import { PrismaServicoRepository } from './prisma-servico.repository';
import { PrismaVeiculoRepository } from './prisma-veiculo.repository';

function montarCtx() {
  const delegates = {
    peca: { findUnique: jest.fn(), update: jest.fn() },
    insumo: { findUnique: jest.fn(), update: jest.fn() },
    servico: { findUnique: jest.fn() },
    cliente: { findFirst: jest.fn() },
    usuario: { findFirst: jest.fn() },
    veiculo: { findFirst: jest.fn() },
    veiculoCliente: { findUnique: jest.fn() },
  };
  const ctx = {
    cliente: jest.fn().mockReturnValue(delegates),
  } as unknown as PrismaTransactionContext;

  return { ctx, delegates };
}

describe('PrismaPecaRepository (OS)', () => {
  it('reconstitui a peça com o valor como Dinheiro', async () => {
    const { ctx, delegates } = montarCtx();
    delegates.peca.findUnique.mockResolvedValue({
      pecaId: 42,
      nome: 'Vela',
      qtdEstoque: 10,
      valorUn: '9.90',
      deletadoEm: null,
    });

    const peca = await new PrismaPecaRepository(ctx).buscarPorId(42);

    expect(delegates.peca.findUnique).toHaveBeenCalledWith({
      where: { pecaId: 42 },
    });
    expect(peca?.pecaId).toBe(42);
    expect(peca?.valorUn.paraNumero()).toBe(9.9);
  });

  it('devolve null quando a peça não existe', async () => {
    const { ctx, delegates } = montarCtx();
    delegates.peca.findUnique.mockResolvedValue(null);

    await expect(
      new PrismaPecaRepository(ctx).buscarPorId(42),
    ).resolves.toBeNull();
  });

  it('trata peça com soft delete como inexistente', async () => {
    const { ctx, delegates } = montarCtx();
    delegates.peca.findUnique.mockResolvedValue({
      pecaId: 42,
      nome: 'Vela',
      qtdEstoque: 10,
      valorUn: '9.90',
      deletadoEm: new Date(),
    });

    await expect(
      new PrismaPecaRepository(ctx).buscarPorId(42),
    ).resolves.toBeNull();
  });

  it('só persiste o estoque ao salvar (o resto é do módulo de catálogo)', async () => {
    const { ctx, delegates } = montarCtx();
    delegates.peca.findUnique.mockResolvedValue({
      pecaId: 42,
      nome: 'Vela',
      qtdEstoque: 7,
      valorUn: '9.90',
      deletadoEm: null,
    });
    const repo = new PrismaPecaRepository(ctx);
    const peca = await repo.buscarPorId(42);

    await repo.salvar(peca!);

    expect(delegates.peca.update).toHaveBeenCalledWith({
      where: { pecaId: 42 },
      data: { qtdEstoque: 7 },
    });
  });
});

describe('PrismaInsumoRepository (OS)', () => {
  it('reconstitui o insumo com o valor como Dinheiro', async () => {
    const { ctx, delegates } = montarCtx();
    delegates.insumo.findUnique.mockResolvedValue({
      insumoId: 7,
      nome: 'Óleo 5W30',
      qtdEstoque: 20,
      valorUn: '45.00',
      deletadoEm: null,
    });

    const insumo = await new PrismaInsumoRepository(ctx).buscarPorId(7);

    expect(insumo?.insumoId).toBe(7);
    expect(insumo?.valorUn.paraNumero()).toBe(45);
  });

  it('devolve null quando o insumo não existe', async () => {
    const { ctx, delegates } = montarCtx();
    delegates.insumo.findUnique.mockResolvedValue(null);

    await expect(
      new PrismaInsumoRepository(ctx).buscarPorId(7),
    ).resolves.toBeNull();
  });

  it('trata insumo com soft delete como inexistente', async () => {
    const { ctx, delegates } = montarCtx();
    delegates.insumo.findUnique.mockResolvedValue({
      insumoId: 7,
      nome: 'Óleo 5W30',
      qtdEstoque: 20,
      valorUn: '45.00',
      deletadoEm: new Date(),
    });

    await expect(
      new PrismaInsumoRepository(ctx).buscarPorId(7),
    ).resolves.toBeNull();
  });

  it('só persiste o estoque ao salvar', async () => {
    const { ctx, delegates } = montarCtx();
    delegates.insumo.findUnique.mockResolvedValue({
      insumoId: 7,
      nome: 'Óleo 5W30',
      qtdEstoque: 16,
      valorUn: '45.00',
      deletadoEm: null,
    });
    const repo = new PrismaInsumoRepository(ctx);
    const insumo = await repo.buscarPorId(7);

    await repo.salvar(insumo!);

    expect(delegates.insumo.update).toHaveBeenCalledWith({
      where: { insumoId: 7 },
      data: { qtdEstoque: 16 },
    });
  });
});

describe('PrismaServicoRepository (OS)', () => {
  it('reconstitui o serviço com o valor como Dinheiro', async () => {
    const { ctx, delegates } = montarCtx();
    delegates.servico.findUnique.mockResolvedValue({
      servicoId: 5,
      descricao: 'Troca de óleo',
      valor: '120.00',
      deletadoEm: null,
    });

    const servico = await new PrismaServicoRepository(ctx).buscarPorId(5);

    expect(servico?.descricao).toBe('Troca de óleo');
    expect(servico?.valor.paraNumero()).toBe(120);
  });

  it('devolve null quando o serviço não existe', async () => {
    const { ctx, delegates } = montarCtx();
    delegates.servico.findUnique.mockResolvedValue(null);

    await expect(
      new PrismaServicoRepository(ctx).buscarPorId(5),
    ).resolves.toBeNull();
  });

  it('trata serviço com soft delete como inexistente', async () => {
    const { ctx, delegates } = montarCtx();
    delegates.servico.findUnique.mockResolvedValue({
      servicoId: 5,
      descricao: 'Troca de óleo',
      valor: '120.00',
      deletadoEm: new Date(),
    });

    await expect(
      new PrismaServicoRepository(ctx).buscarPorId(5),
    ).resolves.toBeNull();
  });
});

describe('PrismaClienteRepository (OS)', () => {
  it('projeta apenas id, nome e documento', async () => {
    const { ctx, delegates } = montarCtx();
    delegates.cliente.findFirst.mockResolvedValue({
      clienteId: 'c1',
      nome: 'Maria',
      numDocumento: '111.444.777-35',
    });

    const cliente = await new PrismaClienteRepository(ctx).buscarPorId('c1');

    expect(delegates.cliente.findFirst).toHaveBeenCalledWith({
      where: { clienteId: 'c1', deletadoEm: null },
    });
    expect(cliente?.clienteId).toBe('c1');
    expect(cliente?.numDocumento).toBe('111.444.777-35');
  });

  it('devolve null quando não encontra', async () => {
    const { ctx, delegates } = montarCtx();
    delegates.cliente.findFirst.mockResolvedValue(null);

    await expect(
      new PrismaClienteRepository(ctx).buscarPorId('sumiu'),
    ).resolves.toBeNull();
  });
});

describe('PrismaMecanicoRepository (OS)', () => {
  it('lê o mecânico da tabela de usuários', async () => {
    const { ctx, delegates } = montarCtx();
    delegates.usuario.findFirst.mockResolvedValue({
      idUsuario: 3,
      nome: 'Carlos',
    });

    const mecanico = await new PrismaMecanicoRepository(ctx).buscarPorId(3);

    expect(delegates.usuario.findFirst).toHaveBeenCalledWith({
      where: { idUsuario: 3, deletadoEm: null },
    });
    expect(mecanico?.nome).toBe('Carlos');
  });

  it('devolve null quando não encontra', async () => {
    const { ctx, delegates } = montarCtx();
    delegates.usuario.findFirst.mockResolvedValue(null);

    await expect(
      new PrismaMecanicoRepository(ctx).buscarPorId(99),
    ).resolves.toBeNull();
  });
});

describe('PrismaVeiculoRepository (OS)', () => {
  it('projeta id, placa, marca e modelo', async () => {
    const { ctx, delegates } = montarCtx();
    delegates.veiculo.findFirst.mockResolvedValue({
      veiculoId: 'v1',
      placa: 'ABC1D23',
      marca: 'Toyota',
      modelo: 'Corolla',
    });

    const veiculo = await new PrismaVeiculoRepository(ctx).buscarPorId('v1');

    expect(veiculo?.placa).toBe('ABC1D23');
  });

  it('devolve null quando não encontra', async () => {
    const { ctx, delegates } = montarCtx();
    delegates.veiculo.findFirst.mockResolvedValue(null);

    await expect(
      new PrismaVeiculoRepository(ctx).buscarPorId('sumiu'),
    ).resolves.toBeNull();
  });

  it('confirma o vínculo veiculo-cliente pela chave composta', async () => {
    const { ctx, delegates } = montarCtx();
    delegates.veiculoCliente.findUnique.mockResolvedValue({
      veiculoId: 'v1',
      clienteId: 'c1',
    });

    await expect(
      new PrismaVeiculoRepository(ctx).veiculoPertenceAoCliente('v1', 'c1'),
    ).resolves.toBe(true);
    expect(delegates.veiculoCliente.findUnique).toHaveBeenCalledWith({
      where: { veiculoId_clienteId: { veiculoId: 'v1', clienteId: 'c1' } },
    });
  });

  it('nega o vínculo quando não há linha na tabela de junção', async () => {
    const { ctx, delegates } = montarCtx();
    delegates.veiculoCliente.findUnique.mockResolvedValue(null);

    await expect(
      new PrismaVeiculoRepository(ctx).veiculoPertenceAoCliente('v1', 'c9'),
    ).resolves.toBe(false);
  });
});
