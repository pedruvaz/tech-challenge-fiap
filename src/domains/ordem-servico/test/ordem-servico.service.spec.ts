import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, Status } from '@prisma/client';
import { OrdemServicoResponseDto } from '../dto/ordem-servico-response.dto';
import { OrdemServicoRepository } from '../ordem-servico.repository';
import { OrdemServicoService } from '../ordem-servico.service';

const makeOs = (overrides = {}) => ({
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

const makeServico = (overrides = {}) => ({
  servicoId: 1,
  descricao: 'Troca de Óleo',
  valor: new Prisma.Decimal('80.00'),
  criadoEm: new Date(),
  atualizadoEm: new Date(),
  deletadoEm: null,
  ...overrides,
});

const makePeca = (overrides = {}) => ({
  pecaId: 1,
  nome: 'Filtro de Óleo',
  qtdEstoque: 50,
  valorUn: new Prisma.Decimal('35.90'),
  criadoEm: new Date(),
  atualizadoEm: new Date(),
  deletadoEm: null,
  ...overrides,
});

const makeInsumo = (overrides = {}) => ({
  insumoId: 1,
  nome: 'Óleo Motor 5W30',
  qtdEstoque: 100,
  valorUn: new Prisma.Decimal('28.50'),
  criadoEm: new Date(),
  atualizadoEm: new Date(),
  deletadoEm: null,
  ...overrides,
});

describe('OrdemServicoService', () => {
  let service: OrdemServicoService;
  let repository: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    updateStatus: jest.Mock;
    updateValorFinal: jest.Mock;
    softDelete: jest.Mock;
    addServico: jest.Mock;
    removeServico: jest.Mock;
    findServicoRealizado: jest.Mock;
    addPeca: jest.Mock;
    removePeca: jest.Mock;
    findPecaUtilizada: jest.Mock;
    addInsumo: jest.Mock;
    removeInsumo: jest.Mock;
    findInsumoConsumido: jest.Mock;
    tempoMedioExecucaoMs: jest.Mock;
  };
  let prisma: {
    $transaction: jest.Mock;
    usuario: { findFirst: jest.Mock };
    cliente: { findFirst: jest.Mock };
    veiculo: { findFirst: jest.Mock };
    veiculoCliente: { findUnique: jest.Mock };
    servico: { findUnique: jest.Mock };
    peca: { findUnique: jest.Mock; update: jest.Mock };
    insumo: { findUnique: jest.Mock; update: jest.Mock };
    ordemServico: { findUnique: jest.Mock; update: jest.Mock };
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
  };

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      updateValorFinal: jest.fn(),
      softDelete: jest.fn(),
      addServico: jest.fn(),
      removeServico: jest.fn(),
      findServicoRealizado: jest.fn(),
      addPeca: jest.fn(),
      removePeca: jest.fn(),
      findPecaUtilizada: jest.fn(),
      addInsumo: jest.fn(),
      removeInsumo: jest.fn(),
      findInsumoConsumido: jest.fn(),
      tempoMedioExecucaoMs: jest.fn(),
    };

    prisma = {
      $transaction: jest.fn(),
      usuario: { findFirst: jest.fn() },
      cliente: { findFirst: jest.fn() },
      veiculo: { findFirst: jest.fn() },
      veiculoCliente: { findUnique: jest.fn() },
      servico: { findUnique: jest.fn() },
      peca: { findUnique: jest.fn(), update: jest.fn() },
      insumo: { findUnique: jest.fn(), update: jest.fn() },
      ordemServico: { findUnique: jest.fn(), update: jest.fn() },
      servicoRealizado: {
        upsert: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
      },
      pecaUtilizada: { upsert: jest.fn(), delete: jest.fn(), findUnique: jest.fn() },
      insumoConsumido: {
        upsert: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    service = new OrdemServicoService(
      repository as unknown as OrdemServicoRepository,
      prisma as never,
    );

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('cria OS com sucesso', async () => {
      const os = makeOs();
      prisma.usuario.findFirst.mockResolvedValue({ idUsuario: 1 });
      prisma.cliente.findFirst.mockResolvedValue({ clienteId: 'cliente-uuid' });
      prisma.veiculo.findFirst.mockResolvedValue({ veiculoId: 'veiculo-uuid' });
      prisma.veiculoCliente.findUnique.mockResolvedValue({
        veiculoId: 'veiculo-uuid',
        clienteId: 'cliente-uuid',
      });
      repository.create.mockResolvedValue(os);

      const result = await service.create({
        mecanicoId: 1,
        clienteId: 'cliente-uuid',
        veiculoId: 'veiculo-uuid',
      });

      expect(result).toBeInstanceOf(OrdemServicoResponseDto);
      expect(result.status).toBe('recebida');
      expect(repository.create).toHaveBeenCalledWith({
        usuarioId: 1,
        clienteId: 'cliente-uuid',
        veiculoId: 'veiculo-uuid',
      });
    });

    it('lança NotFoundException quando mecânico não existe', async () => {
      prisma.usuario.findFirst.mockResolvedValue(null);

      await expect(
        service.create({
          mecanicoId: 999,
          clienteId: 'cliente-uuid',
          veiculoId: 'veiculo-uuid',
        }),
      ).rejects.toThrow(NotFoundException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('lança BadRequestException quando o veículo não pertence ao cliente', async () => {
      prisma.usuario.findFirst.mockResolvedValue({ idUsuario: 1 });
      prisma.cliente.findFirst.mockResolvedValue({ clienteId: 'cliente-uuid' });
      prisma.veiculo.findFirst.mockResolvedValue({ veiculoId: 'veiculo-uuid' });
      prisma.veiculoCliente.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          mecanicoId: 1,
          clienteId: 'cliente-uuid',
          veiculoId: 'veiculo-uuid',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('retorna OS quando encontrada', async () => {
      const os = makeOs();
      repository.findById.mockResolvedValue(os);

      const result = await service.findById('os-uuid-1');

      expect(result).toBeInstanceOf(OrdemServicoResponseDto);
      expect(result.osId).toBe('os-uuid-1');
    });

    it('lança NotFoundException quando OS não existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('nao-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('transição válida: recebida → em_diagnostico', async () => {
      const os = makeOs({ status: 'recebida' });
      const updated = makeOs({ status: 'em_diagnostico' });
      repository.findById.mockResolvedValue(os);
      repository.updateStatus.mockResolvedValue(updated);

      const result = await service.updateStatus('os-uuid-1', {
        status: 'em_diagnostico',
      });

      expect(result.status).toBe('em_diagnostico');
    });

    it('lança BadRequestException para transição inválida', async () => {
      const os = makeOs({ status: 'recebida' });
      repository.findById.mockResolvedValue(os);

      await expect(
        service.updateStatus('os-uuid-1', { status: 'finalizada' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('lança NotFoundException quando OS não existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updateStatus('nao-existe', { status: 'em_diagnostico' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('aprovarOrcamento', () => {
    it('transição aguardando_aprovacao → em_execucao', async () => {
      const os = makeOs({ status: 'aguardando_aprovacao' });
      const updated = makeOs({ status: 'em_execucao' });
      repository.findById.mockResolvedValue(os);
      repository.updateStatus.mockResolvedValue(updated);

      const result = await service.aprovarOrcamento('os-uuid-1');

      expect(result).toBeInstanceOf(OrdemServicoResponseDto);
      expect(result.status).toBe('em_execucao');
      expect(repository.updateStatus).toHaveBeenCalledWith(
        'os-uuid-1',
        'em_execucao',
      );
    });

    it('lança BadRequestException quando status não é aguardando_aprovacao', async () => {
      const os = makeOs({ status: 'em_diagnostico' });
      repository.findById.mockResolvedValue(os);

      await expect(service.aprovarOrcamento('os-uuid-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.updateStatus).not.toHaveBeenCalled();
    });

    it('lança NotFoundException quando OS não existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.aprovarOrcamento('nao-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addServico', () => {
    it('adiciona serviço com sucesso', async () => {
      const os = makeOs();
      const updatedOs = makeOs({ valorFinal: new Prisma.Decimal('80') });
      repository.findById
        .mockResolvedValueOnce(os)
        .mockResolvedValueOnce(updatedOs);
      prisma.servico.findUnique.mockResolvedValue(makeServico());
      prisma.$transaction.mockImplementation(
        (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma),
      );
      prisma.servicoRealizado.upsert.mockResolvedValue({});
      prisma.ordemServico.findUnique.mockResolvedValue({
        ...os,
        servicosRealizados: [
          { valor: new Prisma.Decimal('80'), quantidade: 2 },
        ],
        pecasUtilizadas: [],
        insumosConsumidos: [],
      });
      prisma.ordemServico.update.mockResolvedValue({});

      const result = await service.addServico('os-uuid-1', {
        servicoId: 1,
        quantidade: 2,
      });

      expect(result).toBeInstanceOf(OrdemServicoResponseDto);
      // valor unitário (80) × quantidade (2) = 160 — sem dupla contagem
      const valorFinal = prisma.ordemServico.update.mock.calls[0][0].data
        .valorFinal as Prisma.Decimal;
      expect(Number(valorFinal)).toBeCloseTo(160, 2);
    });

    it('lança NotFoundException quando OS não existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.addServico('nao-existe', { servicoId: 1, quantidade: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lança NotFoundException quando serviço não existe', async () => {
      repository.findById.mockResolvedValue(makeOs());
      prisma.servico.findUnique.mockResolvedValue(null);

      await expect(
        service.addServico('os-uuid-1', { servicoId: 999, quantidade: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lança BadRequestException ao adicionar item em OS finalizada', async () => {
      repository.findById.mockResolvedValue(makeOs({ status: 'finalizada' }));

      await expect(
        service.addServico('os-uuid-1', { servicoId: 1, quantidade: 1 }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.servico.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('removeServico', () => {
    it('remove serviço e recalcula o valor final', async () => {
      const os = makeOs();
      repository.findById
        .mockResolvedValueOnce(os)
        .mockResolvedValueOnce(makeOs());
      repository.findServicoRealizado.mockResolvedValue({
        osId: 'os-uuid-1',
        servicoId: 1,
        quantidade: 1,
        valor: new Prisma.Decimal('80'),
      });
      prisma.$transaction.mockImplementation(
        (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma),
      );
      prisma.servicoRealizado.delete.mockResolvedValue({});
      prisma.ordemServico.findUnique.mockResolvedValue({
        ...os,
        servicosRealizados: [],
        pecasUtilizadas: [],
        insumosConsumidos: [],
      });
      prisma.ordemServico.update.mockResolvedValue({});

      const result = await service.removeServico('os-uuid-1', 1);

      expect(result).toBeInstanceOf(OrdemServicoResponseDto);
      expect(prisma.servicoRealizado.delete).toHaveBeenCalledWith({
        where: { osId_servicoId: { osId: 'os-uuid-1', servicoId: 1 } },
      });
    });

    it('lança NotFoundException quando o serviço não está na OS', async () => {
      repository.findById.mockResolvedValue(makeOs());
      repository.findServicoRealizado.mockResolvedValue(null);

      await expect(service.removeServico('os-uuid-1', 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addPeca', () => {
    it('adiciona peça com sucesso', async () => {
      const os = makeOs();
      const updatedOs = makeOs({ valorFinal: new Prisma.Decimal('71.80') });
      repository.findById
        .mockResolvedValueOnce(os)
        .mockResolvedValueOnce(updatedOs);
      prisma.peca.findUnique.mockResolvedValue(makePeca());
      prisma.$transaction.mockImplementation(
        (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma),
      );
      prisma.pecaUtilizada.findUnique.mockResolvedValue(null);
      prisma.peca.update.mockResolvedValue({});
      prisma.pecaUtilizada.upsert.mockResolvedValue({});
      prisma.ordemServico.findUnique.mockResolvedValue({
        ...os,
        servicosRealizados: [],
        pecasUtilizadas: [{ valor: new Prisma.Decimal('35.90'), qtd: 2 }],
        insumosConsumidos: [],
      });
      prisma.ordemServico.update.mockResolvedValue({});

      const result = await service.addPeca('os-uuid-1', { pecaId: 1, qtd: 2 });

      expect(result).toBeInstanceOf(OrdemServicoResponseDto);
      // primeira inclusão: decrementa o estoque pela quantidade total (delta = 2 - 0)
      expect(prisma.peca.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { qtdEstoque: { decrement: 2 } } }),
      );
      // valor unitário (35.90) × quantidade (2) = 71.80
      const valorFinal = prisma.ordemServico.update.mock.calls[0][0].data
        .valorFinal as Prisma.Decimal;
      expect(Number(valorFinal)).toBeCloseTo(71.8, 2);
    });

    it('ajusta o estoque apenas pelo delta ao re-adicionar a mesma peça', async () => {
      const os = makeOs();
      repository.findById
        .mockResolvedValueOnce(os)
        .mockResolvedValueOnce(makeOs());
      prisma.peca.findUnique.mockResolvedValue(makePeca());
      prisma.$transaction.mockImplementation(
        (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma),
      );
      // já existiam 2 unidades dessa peça na OS
      prisma.pecaUtilizada.findUnique.mockResolvedValue({ qtd: 2 });
      prisma.peca.update.mockResolvedValue({});
      prisma.pecaUtilizada.upsert.mockResolvedValue({});
      prisma.ordemServico.findUnique.mockResolvedValue({
        ...os,
        servicosRealizados: [],
        pecasUtilizadas: [{ valor: new Prisma.Decimal('35.90'), qtd: 5 }],
        insumosConsumidos: [],
      });
      prisma.ordemServico.update.mockResolvedValue({});

      await service.addPeca('os-uuid-1', { pecaId: 1, qtd: 5 });

      // delta = 5 - 2 = 3 (não decrementa os 5 de novo)
      expect(prisma.peca.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { qtdEstoque: { decrement: 3 } } }),
      );
    });

    it('lança BadRequestException quando estoque insuficiente', async () => {
      repository.findById.mockResolvedValue(makeOs());
      prisma.peca.findUnique.mockResolvedValue(makePeca({ qtdEstoque: 1 }));
      prisma.$transaction.mockImplementation(
        (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma),
      );
      prisma.pecaUtilizada.findUnique.mockResolvedValue(null);

      await expect(
        service.addPeca('os-uuid-1', { pecaId: 1, qtd: 10 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removePeca', () => {
    it('remove peça e devolve ao estoque', async () => {
      const os = makeOs();
      const updatedOs = makeOs();
      repository.findById
        .mockResolvedValueOnce(os)
        .mockResolvedValueOnce(updatedOs);
      repository.findPecaUtilizada.mockResolvedValue({
        osId: 'os-uuid-1',
        pecaId: 1,
        qtd: 2,
        valor: new Prisma.Decimal('71.80'),
      });
      prisma.$transaction.mockImplementation(
        (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma),
      );
      prisma.peca.update.mockResolvedValue({});
      prisma.pecaUtilizada.delete.mockResolvedValue({});
      prisma.ordemServico.findUnique.mockResolvedValue({
        ...os,
        servicosRealizados: [],
        pecasUtilizadas: [],
        insumosConsumidos: [],
      });
      prisma.ordemServico.update.mockResolvedValue({});

      const result = await service.removePeca('os-uuid-1', 1);

      expect(result).toBeInstanceOf(OrdemServicoResponseDto);
      expect(prisma.peca.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { qtdEstoque: { increment: 2 } } }),
      );
    });

    it('lança NotFoundException quando relação não existe', async () => {
      repository.findById.mockResolvedValue(makeOs());
      repository.findPecaUtilizada.mockResolvedValue(null);

      await expect(service.removePeca('os-uuid-1', 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addInsumo', () => {
    it('adiciona insumo com sucesso', async () => {
      const os = makeOs();
      const updatedOs = makeOs({ valorFinal: new Prisma.Decimal('85.50') });
      repository.findById
        .mockResolvedValueOnce(os)
        .mockResolvedValueOnce(updatedOs);
      prisma.insumo.findUnique.mockResolvedValue(makeInsumo());
      prisma.$transaction.mockImplementation(
        (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma),
      );
      prisma.insumoConsumido.findUnique.mockResolvedValue(null);
      prisma.insumo.update.mockResolvedValue({});
      prisma.insumoConsumido.upsert.mockResolvedValue({});
      prisma.ordemServico.findUnique.mockResolvedValue({
        ...os,
        servicosRealizados: [],
        pecasUtilizadas: [],
        insumosConsumidos: [
          { valor: new Prisma.Decimal('28.50'), qtdConsumida: 3 },
        ],
      });
      prisma.ordemServico.update.mockResolvedValue({});

      const result = await service.addInsumo('os-uuid-1', {
        insumoId: 1,
        qtdConsumida: 3,
      });

      expect(result).toBeInstanceOf(OrdemServicoResponseDto);
      // valor unitário (28.50) × qtd (3) = 85.50
      const valorFinal = prisma.ordemServico.update.mock.calls[0][0].data
        .valorFinal as Prisma.Decimal;
      expect(Number(valorFinal)).toBeCloseTo(85.5, 2);
    });

    it('lança BadRequestException quando estoque insuficiente', async () => {
      repository.findById.mockResolvedValue(makeOs());
      prisma.insumo.findUnique.mockResolvedValue(makeInsumo({ qtdEstoque: 2 }));
      prisma.$transaction.mockImplementation(
        (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma),
      );
      prisma.insumoConsumido.findUnique.mockResolvedValue(null);

      await expect(
        service.addInsumo('os-uuid-1', { insumoId: 1, qtdConsumida: 10 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeInsumo', () => {
    it('remove insumo com sucesso', async () => {
      const os = makeOs();
      repository.findById.mockResolvedValueOnce(os).mockResolvedValueOnce(os);
      repository.findInsumoConsumido.mockResolvedValue({
        osId: 'os-uuid-1',
        insumoId: 1,
        qtdConsumida: 3,
        valor: new Prisma.Decimal('85.50'),
      });
      prisma.$transaction.mockImplementation(
        (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma),
      );
      prisma.insumo.update.mockResolvedValue({});
      prisma.insumoConsumido.delete.mockResolvedValue({});
      prisma.ordemServico.findUnique.mockResolvedValue({
        ...os,
        servicosRealizados: [],
        pecasUtilizadas: [],
        insumosConsumidos: [],
      });
      prisma.ordemServico.update.mockResolvedValue({});

      const result = await service.removeInsumo('os-uuid-1', 1);

      expect(result).toBeInstanceOf(OrdemServicoResponseDto);
    });
  });

  describe('remove', () => {
    it('realiza soft delete', async () => {
      repository.findById.mockResolvedValue(makeOs());
      repository.softDelete.mockResolvedValue({});

      await service.remove('os-uuid-1');

      expect(repository.softDelete).toHaveBeenCalledWith('os-uuid-1');
    });

    it('lança NotFoundException quando OS não existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('nao-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTempoMedio', () => {
    it('retorna métricas de tempo médio', async () => {
      repository.tempoMedioExecucaoMs.mockResolvedValue(3600000);

      const result = await service.getTempoMedio();

      expect(result).toEqual({
        tempoMedioMs: 3600000,
        tempoMedioMinutos: 60,
        tempoMedioHoras: 1,
      });
    });

    it('retorna zeros quando não há registros', async () => {
      repository.tempoMedioExecucaoMs.mockResolvedValue(0);

      const result = await service.getTempoMedio();

      expect(result.tempoMedioMs).toBe(0);
      expect(result.tempoMedioMinutos).toBe(0);
      expect(result.tempoMedioHoras).toBe(0);
    });
  });
});
