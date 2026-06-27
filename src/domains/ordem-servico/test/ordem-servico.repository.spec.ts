import { Prisma, Status } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { OrdemServicoRepository } from '../ordem-servico.repository';

const makeOsData = (overrides = {}) => ({
  osId: 'os-uuid-1',
  usuarioId: 1,
  clienteId: 'cliente-uuid',
  veiculoId: 'veiculo-uuid',
  status: 'recebida' as Status,
  valorFinal: new Prisma.Decimal('0'),
  criadoEm: new Date(),
  atualizadoEm: new Date(),
  deletadoEm: null,
  mecanico: { idUsuario: 1, nome: 'Mecânico' },
  cliente: { clienteId: 'cliente-uuid', nome: 'Cliente', numDocumento: '123' },
  veiculo: {
    veiculoId: 'veiculo-uuid',
    placa: 'ABC-1234',
    marca: 'Toyota',
    modelo: 'Corolla',
  },
  servicosRealizados: [],
  pecasUtilizadas: [],
  insumosConsumidos: [],
  ...overrides,
});

describe('OrdemServicoRepository', () => {
  let repository: OrdemServicoRepository;
  let prisma: {
    ordemServico: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    servicoRealizado: {
      upsert: jest.Mock;
      delete: jest.Mock;
      findUnique: jest.Mock;
    };
    pecaUtilizada: {
      upsert: jest.Mock;
      delete: jest.Mock;
      findUnique: jest.Mock;
    };
    insumoConsumido: {
      upsert: jest.Mock;
      delete: jest.Mock;
      findUnique: jest.Mock;
    };
    historicoStatusOrdemServico: { create: jest.Mock };
    $queryRaw: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      ordemServico: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      servicoRealizado: {
        upsert: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
      },
      pecaUtilizada: {
        upsert: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
      },
      insumoConsumido: {
        upsert: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
      },
      historicoStatusOrdemServico: { create: jest.fn() },
      $queryRaw: jest.fn(),
    };

    repository = new OrdemServicoRepository(prisma as unknown as PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('cria OS com status recebida', async () => {
      const os = makeOsData();
      prisma.ordemServico.create.mockResolvedValue(os);

      const result = await repository.create({
        usuarioId: 1,
        clienteId: 'cliente-uuid',
        veiculoId: 'veiculo-uuid',
      });

      expect(prisma.ordemServico.create).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({ status: 'recebida' }),
        }),
      );
      expect(result).toBe(os);
    });
  });

  describe('findAll', () => {
    it('lista OS não deletadas', async () => {
      const list = [makeOsData()];
      prisma.ordemServico.findMany.mockResolvedValue(list);

      const result = await repository.findAll();

      expect(prisma.ordemServico.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          where: expect.objectContaining({ deletadoEm: null }),
        }),
      );
      expect(result).toBe(list);
    });

    it('filtra por status', async () => {
      prisma.ordemServico.findMany.mockResolvedValue([]);

      await repository.findAll({ status: 'recebida' });

      expect(prisma.ordemServico.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          where: expect.objectContaining({ status: 'recebida' }),
        }),
      );
    });

    it('filtra por clienteId', async () => {
      prisma.ordemServico.findMany.mockResolvedValue([]);

      await repository.findAll({ clienteId: 'cliente-uuid' });

      expect(prisma.ordemServico.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          where: expect.objectContaining({ clienteId: 'cliente-uuid' }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('retorna OS pelo id', async () => {
      const os = makeOsData();
      prisma.ordemServico.findFirst.mockResolvedValue(os);

      const result = await repository.findById('os-uuid-1');

      expect(prisma.ordemServico.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { osId: 'os-uuid-1', deletadoEm: null },
        }),
      );
      expect(result).toBe(os);
    });

    it('retorna null se não encontrado', async () => {
      prisma.ordemServico.findFirst.mockResolvedValue(null);

      const result = await repository.findById('nao-existe');

      expect(result).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('atualiza o status da OS', async () => {
      const updated = makeOsData({ status: 'em_diagnostico' });
      prisma.ordemServico.update.mockResolvedValue(updated);

      const result = await repository.updateStatus(
        'os-uuid-1',
        'em_diagnostico',
      );

      expect(prisma.ordemServico.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { osId: 'os-uuid-1' },
          data: { status: 'em_diagnostico' },
        }),
      );
      expect(result).toBe(updated);
    });
  });

  describe('updateValorFinal', () => {
    it('atualiza o valorFinal da OS', async () => {
      prisma.ordemServico.update.mockResolvedValue({});

      await repository.updateValorFinal('os-uuid-1', 160);

      expect(prisma.ordemServico.update).toHaveBeenCalledWith({
        where: { osId: 'os-uuid-1' },
        data: { valorFinal: 160 },
      });
    });
  });

  describe('softDelete', () => {
    it('marca a OS como deletada', async () => {
      prisma.ordemServico.update.mockResolvedValue({});

      await repository.softDelete('os-uuid-1');

      expect(prisma.ordemServico.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { osId: 'os-uuid-1' },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({ deletadoEm: expect.any(Date) }),
        }),
      );
    });
  });

  describe('addServico', () => {
    it('faz upsert de ServicoRealizado', async () => {
      const sr = {
        osId: 'os-uuid-1',
        servicoId: 1,
        quantidade: 1,
        valor: new Prisma.Decimal('80'),
      };
      prisma.servicoRealizado.upsert.mockResolvedValue(sr);

      const result = await repository.addServico('os-uuid-1', 1, 1, 80);

      expect(prisma.servicoRealizado.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { osId_servicoId: { osId: 'os-uuid-1', servicoId: 1 } },
        }),
      );
      expect(result).toBe(sr);
    });
  });

  describe('removeServico', () => {
    it('deleta ServicoRealizado', async () => {
      prisma.servicoRealizado.delete.mockResolvedValue({});

      await repository.removeServico('os-uuid-1', 1);

      expect(prisma.servicoRealizado.delete).toHaveBeenCalledWith({
        where: { osId_servicoId: { osId: 'os-uuid-1', servicoId: 1 } },
      });
    });
  });

  describe('findServicoRealizado', () => {
    it('retorna o ServicoRealizado pelo osId e servicoId', async () => {
      const sr = { osId: 'os-uuid-1', servicoId: 1, quantidade: 1 };
      prisma.servicoRealizado.findUnique.mockResolvedValue(sr);

      const result = await repository.findServicoRealizado('os-uuid-1', 1);

      expect(prisma.servicoRealizado.findUnique).toHaveBeenCalledWith({
        where: { osId_servicoId: { osId: 'os-uuid-1', servicoId: 1 } },
      });
      expect(result).toBe(sr);
    });
  });

  describe('addPeca', () => {
    it('faz upsert de PecaUtilizada', async () => {
      const pu = {
        osId: 'os-uuid-1',
        pecaId: 1,
        qtd: 2,
        valor: new Prisma.Decimal('71.80'),
      };
      prisma.pecaUtilizada.upsert.mockResolvedValue(pu);

      const result = await repository.addPeca('os-uuid-1', 1, 2, 71.8);

      expect(prisma.pecaUtilizada.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { osId_pecaId: { osId: 'os-uuid-1', pecaId: 1 } },
        }),
      );
      expect(result).toBe(pu);
    });
  });

  describe('removePeca', () => {
    it('deleta PecaUtilizada', async () => {
      prisma.pecaUtilizada.delete.mockResolvedValue({});

      await repository.removePeca('os-uuid-1', 1);

      expect(prisma.pecaUtilizada.delete).toHaveBeenCalledWith({
        where: { osId_pecaId: { osId: 'os-uuid-1', pecaId: 1 } },
      });
    });
  });

  describe('findPecaUtilizada', () => {
    it('retorna a PecaUtilizada pelo osId e pecaId', async () => {
      const pu = { osId: 'os-uuid-1', pecaId: 1, qtd: 2 };
      prisma.pecaUtilizada.findUnique.mockResolvedValue(pu);

      const result = await repository.findPecaUtilizada('os-uuid-1', 1);

      expect(prisma.pecaUtilizada.findUnique).toHaveBeenCalledWith({
        where: { osId_pecaId: { osId: 'os-uuid-1', pecaId: 1 } },
      });
      expect(result).toBe(pu);
    });
  });

  describe('addInsumo', () => {
    it('faz upsert de InsumoConsumido', async () => {
      const ic = {
        osId: 'os-uuid-1',
        insumoId: 1,
        qtdConsumida: 3,
        valor: new Prisma.Decimal('85.50'),
      };
      prisma.insumoConsumido.upsert.mockResolvedValue(ic);

      const result = await repository.addInsumo('os-uuid-1', 1, 3, 85.5);

      expect(prisma.insumoConsumido.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { osId_insumoId: { osId: 'os-uuid-1', insumoId: 1 } },
        }),
      );
      expect(result).toBe(ic);
    });
  });

  describe('removeInsumo', () => {
    it('deleta InsumoConsumido', async () => {
      prisma.insumoConsumido.delete.mockResolvedValue({});

      await repository.removeInsumo('os-uuid-1', 1);

      expect(prisma.insumoConsumido.delete).toHaveBeenCalledWith({
        where: { osId_insumoId: { osId: 'os-uuid-1', insumoId: 1 } },
      });
    });
  });

  describe('findInsumoConsumido', () => {
    it('retorna o InsumoConsumido pelo osId e insumoId', async () => {
      const ic = { osId: 'os-uuid-1', insumoId: 1, qtdConsumida: 3 };
      prisma.insumoConsumido.findUnique.mockResolvedValue(ic);

      const result = await repository.findInsumoConsumido('os-uuid-1', 1);

      expect(prisma.insumoConsumido.findUnique).toHaveBeenCalledWith({
        where: { osId_insumoId: { osId: 'os-uuid-1', insumoId: 1 } },
      });
      expect(result).toBe(ic);
    });
  });

  describe('registrarTransicao', () => {
    it('cria uma linha no histórico de status', async () => {
      prisma.historicoStatusOrdemServico.create.mockResolvedValue({});

      await repository.registrarTransicao(prisma as never, {
        osId: 'os-uuid-1',
        statusAnterior: 'recebida',
        statusNovo: 'em_diagnostico',
        usuarioId: 7,
      });

      expect(prisma.historicoStatusOrdemServico.create).toHaveBeenCalledWith({
        data: {
          osId: 'os-uuid-1',
          statusAnterior: 'recebida',
          statusNovo: 'em_diagnostico',
          usuarioId: 7,
        },
      });
    });

    it('normaliza usuarioId ausente para null', async () => {
      prisma.historicoStatusOrdemServico.create.mockResolvedValue({});

      await repository.registrarTransicao(prisma as never, {
        osId: 'os-uuid-1',
        statusAnterior: null,
        statusNovo: 'recebida',
      });

      expect(prisma.historicoStatusOrdemServico.create).toHaveBeenCalledWith({
        data: {
          osId: 'os-uuid-1',
          statusAnterior: null,
          statusNovo: 'recebida',
          usuarioId: null,
        },
      });
    });
  });

  describe('tempoMedioExecucaoMs', () => {
    it('retorna o tempo médio calculado', async () => {
      prisma.$queryRaw.mockResolvedValue([{ media: 3600000 }]);

      const result = await repository.tempoMedioExecucaoMs();

      expect(result).toBe(3600000);
    });

    it('retorna 0 quando não há registros', async () => {
      prisma.$queryRaw.mockResolvedValue([{ media: null }]);

      const result = await repository.tempoMedioExecucaoMs();

      expect(result).toBe(0);
    });

    it('retorna 0 quando o resultado está vazio', async () => {
      prisma.$queryRaw.mockResolvedValue([{}]);

      const result = await repository.tempoMedioExecucaoMs();

      expect(result).toBe(0);
    });
  });
});
