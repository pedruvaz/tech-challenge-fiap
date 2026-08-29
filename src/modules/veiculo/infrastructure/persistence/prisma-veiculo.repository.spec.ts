import { PrismaService } from '../../../../prisma/prisma.service';
import { Veiculo } from '../../domain/entities/veiculo.entity';
import { Placa } from '../../domain/value-objects/placa.vo';
import { PrismaVeiculoRepository } from './prisma-veiculo.repository';

const linha = (over: Record<string, unknown> = {}) => ({
  veiculoId: 'v1',
  placa: 'ABC1D23',
  marca: 'Toyota',
  modelo: 'Corolla',
  ano: '2020',
  cor: 'Preto',
  criadoEm: new Date('2024-01-01T00:00:00Z'),
  atualizadoEm: new Date('2024-02-01T00:00:00Z'),
  deletadoEm: null,
  ...over,
});

function montar() {
  const veiculoDelegate = {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const tx = {
    veiculo: { create: jest.fn() },
    veiculoCliente: { create: jest.fn() },
  };
  const prisma = {
    veiculo: veiculoDelegate,
    $transaction: jest.fn(
      (fn: (t: typeof tx) => Promise<unknown>): Promise<unknown> => fn(tx),
    ),
  };

  return {
    repo: new PrismaVeiculoRepository(prisma as unknown as PrismaService),
    prisma,
    veiculoDelegate,
    tx,
  };
}

const veiculoNovo = (clienteId: string | null = 'c1'): Veiculo =>
  Veiculo.criar({
    veiculoId: 'v1',
    placa: 'ABC1D23',
    marca: 'Toyota',
    modelo: 'Corolla',
    ano: '2020',
    cor: 'Preto',
    clienteProprietarioId: clienteId as string,
  });

const veiculoPersistido = (): Veiculo =>
  Veiculo.reconstituir({
    veiculoId: 'v1',
    placa: Placa.reconstituir('ABC1D23'),
    marca: 'Toyota',
    modelo: 'Corolla',
    ano: '2020',
    cor: 'Preto',
    criadoEm: new Date('2024-01-01T00:00:00Z'),
    atualizadoEm: new Date('2024-02-01T00:00:00Z'),
    deletadoEm: null,
  });

describe('PrismaVeiculoRepository', () => {
  describe('buscarPorId', () => {
    it('filtra por deletadoEm null e reconstitui a entidade', async () => {
      const { repo, veiculoDelegate } = montar();
      veiculoDelegate.findFirst.mockResolvedValue(linha());

      const veiculo = await repo.buscarPorId('v1');

      expect(veiculoDelegate.findFirst).toHaveBeenCalledWith({
        where: { veiculoId: 'v1', deletadoEm: null },
      });
      expect(veiculo?.veiculoId).toBe('v1');
      expect(veiculo?.placa.valor).toBe('ABC1D23');
    });

    it('devolve null quando nada é encontrado', async () => {
      const { repo, veiculoDelegate } = montar();
      veiculoDelegate.findFirst.mockResolvedValue(null);

      await expect(repo.buscarPorId('sumiu')).resolves.toBeNull();
    });
  });

  describe('listar', () => {
    it('devolve apenas os não deletados, ordenados por id', async () => {
      const { repo, veiculoDelegate } = montar();
      veiculoDelegate.findMany.mockResolvedValue([
        linha(),
        linha({ veiculoId: 'v2', placa: 'XYZ4321' }),
      ]);

      const veiculos = await repo.listar();

      expect(veiculoDelegate.findMany).toHaveBeenCalledWith({
        where: { deletadoEm: null },
        orderBy: { veiculoId: 'asc' },
      });
      expect(veiculos.map((v) => v.veiculoId)).toEqual(['v1', 'v2']);
    });

    it('devolve lista vazia quando não há linhas', async () => {
      const { repo, veiculoDelegate } = montar();
      veiculoDelegate.findMany.mockResolvedValue([]);

      await expect(repo.listar()).resolves.toEqual([]);
    });
  });

  describe('existeComPlaca', () => {
    it('é falso quando nenhuma linha usa a placa', async () => {
      const { repo, veiculoDelegate } = montar();
      veiculoDelegate.findFirst.mockResolvedValue(null);

      await expect(repo.existeComPlaca('ABC1D23')).resolves.toBe(false);
    });

    it('é verdadeiro quando outra linha usa a placa', async () => {
      const { repo, veiculoDelegate } = montar();
      veiculoDelegate.findFirst.mockResolvedValue({ veiculoId: 'outro' });

      await expect(repo.existeComPlaca('ABC1D23')).resolves.toBe(true);
    });

    it('ignora o próprio veículo na checagem de unicidade', async () => {
      const { repo, veiculoDelegate } = montar();
      veiculoDelegate.findFirst.mockResolvedValue({ veiculoId: 'v1' });

      await expect(repo.existeComPlaca('ABC1D23', 'v1')).resolves.toBe(false);
    });

    it('continua sendo conflito quando o id a ignorar é outro', async () => {
      const { repo, veiculoDelegate } = montar();
      veiculoDelegate.findFirst.mockResolvedValue({ veiculoId: 'v9' });

      await expect(repo.existeComPlaca('ABC1D23', 'v1')).resolves.toBe(true);
    });
  });

  describe('salvar', () => {
    it('cria veículo e vínculo com o cliente na mesma transação', async () => {
      const { repo, prisma, tx } = montar();

      await repo.salvar(veiculoNovo('c1'));

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(tx.veiculo.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          veiculoId: 'v1',
          placa: 'ABC1D23',
        }) as unknown,
      });
      expect(tx.veiculoCliente.create).toHaveBeenCalledWith({
        data: { veiculoId: 'v1', clienteId: 'c1' },
      });
    });

    it('recusa criar veículo sem proprietário (invariante)', async () => {
      const { repo, prisma } = montar();

      await expect(repo.salvar(veiculoNovo(null))).rejects.toThrow(
        'invariante violada',
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('atualiza sem transação quando o veículo já existia', async () => {
      const { repo, prisma, veiculoDelegate } = montar();

      await repo.salvar(veiculoPersistido());

      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(veiculoDelegate.update).toHaveBeenCalledWith({
        where: { veiculoId: 'v1' },
        data: {
          placa: 'ABC1D23',
          marca: 'Toyota',
          modelo: 'Corolla',
          ano: '2020',
          cor: 'Preto',
          deletadoEm: null,
        },
      });
    });

    it('persiste o soft delete no update', async () => {
      const { repo, veiculoDelegate } = montar();
      const veiculo = veiculoPersistido();
      const agora = new Date('2025-01-01T00:00:00Z');
      veiculo.softDelete(agora);

      await repo.salvar(veiculo);

      expect(veiculoDelegate.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ deletadoEm: agora }) as unknown,
        }),
      );
    });
  });
});
