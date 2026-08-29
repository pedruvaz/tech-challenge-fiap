import { PrismaService } from '../../../../prisma/prisma.service';
import { Peca } from '../../domain/entities/peca.entity';
import { PrismaPecaRepository } from './prisma-peca.repository';

const linha = (over: Record<string, unknown> = {}) => ({
  pecaId: 42,
  nome: 'Filtro de óleo',
  qtdEstoque: 10,
  valorUn: 39.9,
  criadoEm: new Date('2024-01-01T00:00:00Z'),
  atualizadoEm: new Date('2024-02-01T00:00:00Z'),
  deletadoEm: null,
  ...over,
});

const pecaPersistido = (pecaId = 42): Peca =>
  Peca.reconstituir({
    pecaId,
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
    repo: new PrismaPecaRepository({
      peca: delegate,
    } as unknown as PrismaService),
    delegate,
  };
}

describe('PrismaPecaRepository', () => {
  describe('buscarPorId', () => {
    it('filtra por deletadoEm null e reconstitui', async () => {
      const { repo, delegate } = montar();
      delegate.findFirst.mockResolvedValue(linha());

      const achado = await repo.buscarPorId(42);

      expect(delegate.findFirst).toHaveBeenCalledWith({
        where: { pecaId: 42, deletadoEm: null },
      });
      expect(achado?.pecaId).toBe(42);
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
      delegate.findMany.mockResolvedValue([linha(), linha({ pecaId: 43 })]);

      const itens = await repo.listar();

      expect(delegate.findMany).toHaveBeenCalledWith({
        where: { deletadoEm: null },
        orderBy: { pecaId: 'asc' },
      });
      expect(itens.map((i) => i.pecaId)).toEqual([42, 43]);
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
      delegate.create.mockResolvedValue(linha({ pecaId: 7 }));

      const salvo = await repo.salvar(
        Peca.criar({ nome: 'Filtro de óleo', qtdEstoque: 10, valorUn: 39.9 }),
      );

      expect(delegate.create).toHaveBeenCalledWith({
        data: {
          nome: 'Filtro de óleo',
          qtdEstoque: 10,
          valorUn: 39.9,
          deletadoEm: null,
        },
      });
      expect(salvo.pecaId).toBe(7);
    });

    it('atualiza pelo id quando o registro já existia', async () => {
      const { repo, delegate } = montar();
      delegate.update.mockResolvedValue(linha());

      const salvo = await repo.salvar(pecaPersistido());

      expect(delegate.update).toHaveBeenCalledWith({
        where: { pecaId: 42 },
        data: expect.objectContaining({ deletadoEm: null }) as unknown,
      });
      expect(salvo.pecaId).toBe(42);
      expect(delegate.create).not.toHaveBeenCalled();
    });

    it('recusa atualizar entidade reconstituída sem id (invariante)', async () => {
      const { repo, delegate } = montar();
      const semId = Peca.reconstituir({
        pecaId: null as unknown as number,
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
      const alvo = pecaPersistido();
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
