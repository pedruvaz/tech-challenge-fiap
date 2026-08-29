import { PrismaService } from '../../../../prisma/prisma.service';
import { Insumo } from '../../domain/entities/insumo.entity';
import { PrismaInsumoRepository } from './prisma-insumo.repository';

const linha = (over: Record<string, unknown> = {}) => ({
  insumoId: 42,
  nome: 'Filtro de óleo',
  qtdEstoque: 10,
  valorUn: 39.9,
  criadoEm: new Date('2024-01-01T00:00:00Z'),
  atualizadoEm: new Date('2024-02-01T00:00:00Z'),
  deletadoEm: null,
  ...over,
});

const insumoPersistido = (insumoId = 42): Insumo =>
  Insumo.reconstituir({
    insumoId,
    nome: 'Filtro de óleo',
    qtdEstoque: 10,
    valorUn: 39.9,
    criadoEm: new Date('2024-01-01T00:00:00Z'),
    atualizadoEm: new Date('2024-02-01T00:00:00Z'),
    deletadoEm: null,
  });

function montar() {
  const delegate = {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  return {
    repo: new PrismaInsumoRepository({
      insumo: delegate,
    } as unknown as PrismaService),
    delegate,
  };
}

describe('PrismaInsumoRepository', () => {
  describe('buscarPorId', () => {
    it('filtra por deletadoEm null e reconstitui', async () => {
      const { repo, delegate } = montar();
      delegate.findFirst.mockResolvedValue(linha());

      const achado = await repo.buscarPorId(42);

      expect(delegate.findFirst).toHaveBeenCalledWith({
        where: { insumoId: 42, deletadoEm: null },
      });
      expect(achado?.insumoId).toBe(42);
    });

    it('devolve null quando não encontra', async () => {
      const { repo, delegate } = montar();
      delegate.findFirst.mockResolvedValue(null);

      await expect(repo.buscarPorId(99)).resolves.toBeNull();
    });
  });

  describe('listar', () => {
    it('devolve apenas os não deletados, ordenados por id', async () => {
      const { repo, delegate } = montar();
      delegate.findMany.mockResolvedValue([linha(), linha({ insumoId: 43 })]);

      const itens = await repo.listar();

      expect(delegate.findMany).toHaveBeenCalledWith({
        where: { deletadoEm: null },
        orderBy: { insumoId: 'asc' },
      });
      expect(itens.map((i) => i.insumoId)).toEqual([42, 43]);
    });

    it('devolve lista vazia quando não há linhas', async () => {
      const { repo, delegate } = montar();
      delegate.findMany.mockResolvedValue([]);

      await expect(repo.listar()).resolves.toEqual([]);
    });
  });

  describe('salvar', () => {
    it('cria e devolve a entidade com o id atribuído pelo banco', async () => {
      const { repo, delegate } = montar();
      delegate.create.mockResolvedValue(linha({ insumoId: 7 }));

      const salvo = await repo.salvar(
        Insumo.criar({ nome: 'Filtro de óleo', qtdEstoque: 10, valorUn: 39.9 }),
      );

      expect(delegate.create).toHaveBeenCalledWith({
        data: {
          nome: 'Filtro de óleo',
          qtdEstoque: 10,
          valorUn: 39.9,
          deletadoEm: null,
        },
      });
      expect(salvo.insumoId).toBe(7);
    });

    it('atualiza pelo id quando o registro já existia', async () => {
      const { repo, delegate } = montar();
      delegate.update.mockResolvedValue(linha());

      const salvo = await repo.salvar(insumoPersistido());

      expect(delegate.update).toHaveBeenCalledWith({
        where: { insumoId: 42 },
        data: expect.objectContaining({ deletadoEm: null }) as unknown,
      });
      expect(salvo.insumoId).toBe(42);
      expect(delegate.create).not.toHaveBeenCalled();
    });

    it('recusa atualizar entidade reconstituída sem id (invariante)', async () => {
      const { repo, delegate } = montar();
      const semId = Insumo.reconstituir({
        insumoId: null as unknown as number,
        nome: 'Filtro de óleo',
        qtdEstoque: 10,
        valorUn: 39.9,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        deletadoEm: null,
      });

      await expect(repo.salvar(semId)).rejects.toThrow('invariante violada');
      expect(delegate.update).not.toHaveBeenCalled();
    });

    it('persiste o soft delete no update', async () => {
      const { repo, delegate } = montar();
      delegate.update.mockResolvedValue(linha());
      const alvo = insumoPersistido();
      const agora = new Date('2025-01-01T00:00:00Z');
      alvo.softDelete(agora);

      await repo.salvar(alvo);

      expect(delegate.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ deletadoEm: agora }) as unknown,
        }),
      );
    });
  });
});
