import { OrdemServico } from '../../domain/entities/ordem-servico.entity';
import { PecaUtilizada } from '../../domain/entities/peca-utilizada.entity';
import { ServicoRealizado } from '../../domain/entities/servico-realizado.entity';
import { InsumoConsumido } from '../../domain/entities/insumo-consumido.entity';
import { Dinheiro } from '../../domain/value-objects/dinheiro.vo';
import { PrismaOrdemServicoRepository } from './prisma-ordem-servico.repository';
import { PrismaTransactionContext } from './prisma-transaction-context';

const INCLUDE_FILHAS = {
  servicosRealizados: true,
  pecasUtilizadas: true,
  insumosConsumidos: true,
};

const linha = (over: Record<string, unknown> = {}) => ({
  osId: 'os-1',
  usuarioId: 3,
  clienteId: 'c1',
  veiculoId: 'v1',
  status: 'recebida',
  criadoEm: new Date('2024-01-01T00:00:00Z'),
  atualizadoEm: new Date('2024-02-01T00:00:00Z'),
  deletadoEm: null,
  servicosRealizados: [],
  pecasUtilizadas: [],
  insumosConsumidos: [],
  ...over,
});

function montar() {
  const delegates = {
    ordemServico: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    servicoRealizado: { deleteMany: jest.fn(), createMany: jest.fn() },
    pecaUtilizada: { deleteMany: jest.fn(), createMany: jest.fn() },
    insumoConsumido: { deleteMany: jest.fn(), createMany: jest.fn() },
    historicoStatusOrdemServico: { create: jest.fn() },
    $queryRaw: jest.fn(),
  };
  const ctx = {
    cliente: jest.fn().mockReturnValue(delegates),
  } as unknown as PrismaTransactionContext;

  return { repo: new PrismaOrdemServicoRepository(ctx), delegates };
}

const novaOs = (): OrdemServico =>
  OrdemServico.criar({
    osId: 'os-1',
    mecanicoId: 3,
    clienteId: 'c1',
    veiculoId: 'v1',
  });

const osPersistida = (): OrdemServico =>
  OrdemServico.reconstituir({
    osId: 'os-1',
    mecanicoId: 3,
    clienteId: 'c1',
    veiculoId: 'v1',
    status: novaOs().status,
    criadoEm: new Date('2024-01-01T00:00:00Z'),
    atualizadoEm: new Date('2024-02-01T00:00:00Z'),
    deletadoEm: null,
    servicos: [],
    pecas: [],
    insumos: [],
  });

describe('PrismaOrdemServicoRepository', () => {
  describe('buscarPorId', () => {
    it('filtra por deletadoEm null e traz as coleções filhas', async () => {
      const { repo, delegates } = montar();
      delegates.ordemServico.findFirst.mockResolvedValue(linha());

      const os = await repo.buscarPorId('os-1');

      expect(delegates.ordemServico.findFirst).toHaveBeenCalledWith({
        where: { osId: 'os-1', deletadoEm: null },
        include: INCLUDE_FILHAS,
      });
      expect(os?.osId).toBe('os-1');
    });

    it('devolve null quando a OS não existe', async () => {
      const { repo, delegates } = montar();
      delegates.ordemServico.findFirst.mockResolvedValue(null);

      await expect(repo.buscarPorId('sumiu')).resolves.toBeNull();
    });
  });

  describe('listar', () => {
    it('lista sem filtros quando nenhum é informado', async () => {
      const { repo, delegates } = montar();
      delegates.ordemServico.findMany.mockResolvedValue([linha()]);

      const oss = await repo.listar();

      expect(delegates.ordemServico.findMany).toHaveBeenCalledWith({
        where: { deletadoEm: null },
        include: INCLUDE_FILHAS,
      });
      expect(oss).toHaveLength(1);
    });

    it('aplica o filtro de status', async () => {
      const { repo, delegates } = montar();
      delegates.ordemServico.findMany.mockResolvedValue([]);

      await repo.listar({ status: 'em_execucao' });

      expect(delegates.ordemServico.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletadoEm: null, status: 'em_execucao' },
        }),
      );
    });

    it('aplica o filtro de cliente', async () => {
      const { repo, delegates } = montar();
      delegates.ordemServico.findMany.mockResolvedValue([]);

      await repo.listar({ clienteId: 'c1' });

      expect(delegates.ordemServico.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletadoEm: null, clienteId: 'c1' },
        }),
      );
    });

    it('ignora filtros vazios', async () => {
      const { repo, delegates } = montar();
      delegates.ordemServico.findMany.mockResolvedValue([]);

      await repo.listar({ status: undefined, clienteId: undefined });

      expect(delegates.ordemServico.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { deletadoEm: null } }),
      );
    });
  });

  describe('salvar', () => {
    it('cria a linha da OS quando ela é nova', async () => {
      const { repo, delegates } = montar();

      await repo.salvar(novaOs());

      expect(delegates.ordemServico.create).toHaveBeenCalledWith({
        data: {
          osId: 'os-1',
          usuarioId: 3,
          clienteId: 'c1',
          veiculoId: 'v1',
          status: 'recebida',
          valorFinal: 0,
        },
      });
      expect(delegates.ordemServico.update).not.toHaveBeenCalled();
    });

    it('atualiza status, valor e soft delete quando a OS já existia', async () => {
      const { repo, delegates } = montar();
      const os = osPersistida();
      const agora = new Date('2025-01-01T00:00:00Z');
      os.softDelete(agora);

      await repo.salvar(os);

      expect(delegates.ordemServico.update).toHaveBeenCalledWith({
        where: { osId: 'os-1' },
        data: { status: 'recebida', valorFinal: 0, deletadoEm: agora },
      });
      expect(delegates.ordemServico.create).not.toHaveBeenCalled();
    });

    it('limpa as coleções filhas antes de reinseri-las', async () => {
      const { repo, delegates } = montar();

      await repo.salvar(novaOs());

      expect(delegates.servicoRealizado.deleteMany).toHaveBeenCalledWith({
        where: { osId: 'os-1' },
      });
      expect(delegates.pecaUtilizada.deleteMany).toHaveBeenCalledWith({
        where: { osId: 'os-1' },
      });
      expect(delegates.insumoConsumido.deleteMany).toHaveBeenCalledWith({
        where: { osId: 'os-1' },
      });
    });

    it('não chama createMany para coleções vazias', async () => {
      const { repo, delegates } = montar();

      await repo.salvar(novaOs());

      expect(delegates.servicoRealizado.createMany).not.toHaveBeenCalled();
      expect(delegates.pecaUtilizada.createMany).not.toHaveBeenCalled();
      expect(delegates.insumoConsumido.createMany).not.toHaveBeenCalled();
    });

    it('reinsere serviços, peças e insumos com o valor unitário achatado', async () => {
      const { repo, delegates } = montar();
      const os = novaOs();
      os.aplicarServico(new ServicoRealizado(5, 2, Dinheiro.deNumero(120)));
      os.aplicarPeca(new PecaUtilizada(42, 3, Dinheiro.deNumero(9.9)));
      os.aplicarInsumo(new InsumoConsumido(7, 4, Dinheiro.deNumero(45)));

      await repo.salvar(os);

      expect(delegates.servicoRealizado.createMany).toHaveBeenCalledWith({
        data: [{ osId: 'os-1', servicoId: 5, quantidade: 2, valor: 120 }],
      });
      expect(delegates.pecaUtilizada.createMany).toHaveBeenCalledWith({
        data: [{ osId: 'os-1', pecaId: 42, qtd: 3, valor: 9.9 }],
      });
      expect(delegates.insumoConsumido.createMany).toHaveBeenCalledWith({
        data: [{ osId: 'os-1', insumoId: 7, qtdConsumida: 4, valor: 45 }],
      });
    });

    it('grava uma linha de histórico por transição pendente', async () => {
      const { repo, delegates } = montar();
      const os = osPersistida();
      os.avancarStatus('em_diagnostico', 3);
      os.avancarStatus('aguardando_aprovacao');

      await repo.salvar(os);

      expect(
        delegates.historicoStatusOrdemServico.create,
      ).toHaveBeenCalledTimes(2);
      expect(
        delegates.historicoStatusOrdemServico.create,
      ).toHaveBeenNthCalledWith(1, {
        data: {
          osId: 'os-1',
          statusAnterior: 'recebida',
          statusNovo: 'em_diagnostico',
          usuarioId: 3,
        },
      });
      expect(
        delegates.historicoStatusOrdemServico.create,
      ).toHaveBeenNthCalledWith(2, {
        data: {
          osId: 'os-1',
          statusAnterior: 'em_diagnostico',
          statusNovo: 'aguardando_aprovacao',
          usuarioId: null,
        },
      });
    });

    it('não grava histórico quando não houve transição', async () => {
      const { repo, delegates } = montar();

      await repo.salvar(osPersistida());

      expect(
        delegates.historicoStatusOrdemServico.create,
      ).not.toHaveBeenCalled();
    });
  });

  describe('tempoMedioExecucaoMs', () => {
    it('devolve a média apurada pelo histórico', async () => {
      const { repo, delegates } = montar();
      delegates.$queryRaw.mockResolvedValue([{ media: 5_400_000 }]);

      await expect(repo.tempoMedioExecucaoMs()).resolves.toBe(5_400_000);
    });

    it('converte a média numérica vinda como string do Postgres', async () => {
      const { repo, delegates } = montar();
      delegates.$queryRaw.mockResolvedValue([{ media: '5400000' }]);

      await expect(repo.tempoMedioExecucaoMs()).resolves.toBe(5_400_000);
    });

    it('devolve 0 quando a média é nula (nenhuma OS com os dois marcos)', async () => {
      const { repo, delegates } = montar();
      delegates.$queryRaw.mockResolvedValue([{ media: null }]);

      await expect(repo.tempoMedioExecucaoMs()).resolves.toBe(0);
    });

    it('devolve 0 quando a query não retorna linha alguma', async () => {
      const { repo, delegates } = montar();
      delegates.$queryRaw.mockResolvedValue([]);

      await expect(repo.tempoMedioExecucaoMs()).resolves.toBe(0);
    });
  });
});
