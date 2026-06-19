import { Prisma, Status } from '@prisma/client';
import { OrdemServicoResponseDto } from '../dto/ordem-servico-response.dto';
import { OrdemServicoController } from '../ordem-servico.controller';
import { OrdemServicoService } from '../ordem-servico.service';

const makeResponseDto = (overrides = {}): OrdemServicoResponseDto => {
  const os = {
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
    veiculo: { veiculoId: 'veiculo-uuid', placa: 'ABC-1234', marca: 'Toyota', modelo: 'Corolla' },
    servicosRealizados: [],
    pecasUtilizadas: [],
    insumosConsumidos: [],
    ...overrides,
  };
  return new OrdemServicoResponseDto(os);
};

describe('OrdemServicoController', () => {
  let controller: OrdemServicoController;
  let service: jest.Mocked<OrdemServicoService>;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      remove: jest.fn(),
      addServico: jest.fn(),
      removeServico: jest.fn(),
      addPeca: jest.fn(),
      removePeca: jest.fn(),
      addInsumo: jest.fn(),
      removeInsumo: jest.fn(),
      getTempoMedio: jest.fn(),
    } as unknown as jest.Mocked<OrdemServicoService>;

    controller = new OrdemServicoController(service);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('chama service.create e retorna DTO', async () => {
      const dto = { mecanicoId: 1, clienteId: 'cliente-uuid', veiculoId: 'veiculo-uuid' };
      const response = makeResponseDto();
      service.create.mockResolvedValue(response);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(response);
    });
  });

  describe('findAll', () => {
    it('chama service.findAll com filtros e retorna lista', async () => {
      const list = [makeResponseDto()];
      service.findAll.mockResolvedValue(list);

      const result = await controller.findAll('recebida' as Status, 'cliente-uuid');

      expect(service.findAll).toHaveBeenCalledWith({ status: 'recebida', clienteId: 'cliente-uuid' });
      expect(result).toBe(list);
    });

    it('chama service.findAll sem filtros', async () => {
      service.findAll.mockResolvedValue([]);

      await controller.findAll(undefined, undefined);

      expect(service.findAll).toHaveBeenCalledWith({ status: undefined, clienteId: undefined });
    });
  });

  describe('findOne', () => {
    it('retorna OS pelo id', async () => {
      const response = makeResponseDto();
      service.findById.mockResolvedValue(response);

      const result = await controller.findOne('os-uuid-1');

      expect(service.findById).toHaveBeenCalledWith('os-uuid-1');
      expect(result).toBe(response);
    });
  });

  describe('updateStatus', () => {
    it('atualiza status da OS', async () => {
      const response = makeResponseDto({ status: 'em_diagnostico' });
      service.updateStatus.mockResolvedValue(response);

      const result = await controller.updateStatus('os-uuid-1', { status: 'em_diagnostico' });

      expect(service.updateStatus).toHaveBeenCalledWith('os-uuid-1', { status: 'em_diagnostico' });
      expect(result.status).toBe('em_diagnostico');
    });
  });

  describe('remove', () => {
    it('chama service.remove', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('os-uuid-1');

      expect(service.remove).toHaveBeenCalledWith('os-uuid-1');
    });
  });

  describe('addServico', () => {
    it('adiciona serviço à OS', async () => {
      const response = makeResponseDto({ valorFinal: new Prisma.Decimal('80') });
      service.addServico.mockResolvedValue(response);

      const result = await controller.addServico('os-uuid-1', { servicoId: 1, quantidade: 1 });

      expect(service.addServico).toHaveBeenCalledWith('os-uuid-1', { servicoId: 1, quantidade: 1 });
      expect(result).toBe(response);
    });
  });

  describe('addPeca', () => {
    it('adiciona peça à OS', async () => {
      const response = makeResponseDto({ valorFinal: new Prisma.Decimal('71.80') });
      service.addPeca.mockResolvedValue(response);

      const result = await controller.addPeca('os-uuid-1', { pecaId: 1, qtd: 2 });

      expect(service.addPeca).toHaveBeenCalledWith('os-uuid-1', { pecaId: 1, qtd: 2 });
      expect(result).toBe(response);
    });
  });

  describe('addInsumo', () => {
    it('adiciona insumo à OS', async () => {
      const response = makeResponseDto({ valorFinal: new Prisma.Decimal('85.50') });
      service.addInsumo.mockResolvedValue(response);

      const result = await controller.addInsumo('os-uuid-1', { insumoId: 1, qtdConsumida: 3 });

      expect(service.addInsumo).toHaveBeenCalledWith('os-uuid-1', { insumoId: 1, qtdConsumida: 3 });
      expect(result).toBe(response);
    });
  });

  describe('getTempoMedio', () => {
    it('retorna métricas de tempo médio', async () => {
      const metrics = { tempoMedioMs: 3600000, tempoMedioMinutos: 60, tempoMedioHoras: 1 };
      service.getTempoMedio.mockResolvedValue(metrics);

      const result = await controller.getTempoMedio();

      expect(result).toBe(metrics);
    });
  });
});
