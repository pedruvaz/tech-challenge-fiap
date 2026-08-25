import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Cliente, Veiculo } from '@prisma/client';
import { ClienteRepository } from '../../../modules/cliente/domain/repositories/cliente.repository';
import { VeiculoRepository } from '../veiculo.repository';
import { VeiculoService } from '../veiculo.service';

describe('VeiculoService', () => {
  let service: VeiculoService;

  const veiculoMock: Veiculo = {
    veiculoId: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    placa: 'ABC1D23',
    marca: 'Toyota',
    modelo: 'Corolla',
    ano: '2020',
    cor: 'Preto',
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    deletadoEm: null,
  };

  const clienteId = '6a3bd4e0-db9d-4b9a-bb1a-c63dabfa89d2';

  const clienteMock: Cliente = {
    clienteId,
    numDocumento: '123.456.789-09',
    nome: 'Maria Oliveira',
    telefone: '(11) 99999-1111',
    tipo: 'pessoa_fisica',
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    deletadoEm: null,
  };

  const dtoBase = {
    placa: veiculoMock.placa,
    marca: veiculoMock.marca,
    modelo: veiculoMock.modelo,
    ano: veiculoMock.ano,
    cor: veiculoMock.cor,
    clienteId,
  };

  const repositoryMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByPlaca: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  const clienteRepositoryMock = {
    buscarPorId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VeiculoService,
        { provide: VeiculoRepository, useValue: repositoryMock },
        { provide: ClienteRepository, useValue: clienteRepositoryMock },
      ],
    }).compile();

    service = module.get<VeiculoService>(VeiculoService);
  });

  describe('create', () => {
    it('deve criar um veículo', async () => {
      repositoryMock.findByPlaca.mockResolvedValue(null);
      clienteRepositoryMock.buscarPorId.mockResolvedValue(clienteMock);
      repositoryMock.create.mockResolvedValue(veiculoMock);

      const resultado = await service.create(dtoBase);

      expect(resultado.placa).toBe(veiculoMock.placa);
      expect(repositoryMock.create).toHaveBeenCalledWith(dtoBase);
    });

    it('deve lançar ConflictException se a placa já existir', async () => {
      repositoryMock.findByPlaca.mockResolvedValue(veiculoMock);

      await expect(service.create(dtoBase)).rejects.toThrow(ConflictException);

      expect(repositoryMock.create).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se o cliente não existir', async () => {
      repositoryMock.findByPlaca.mockResolvedValue(null);
      clienteRepositoryMock.buscarPorId.mockResolvedValue(null);

      await expect(service.create(dtoBase)).rejects.toThrow(NotFoundException);

      expect(repositoryMock.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar a lista de veículos', async () => {
      repositoryMock.findAll.mockResolvedValue([veiculoMock]);

      const resultado = await service.findAll();

      expect(resultado).toHaveLength(1);
      expect(resultado[0].placa).toBe(veiculoMock.placa);
    });
  });

  describe('findById', () => {
    it('deve retornar um veículo existente', async () => {
      repositoryMock.findById.mockResolvedValue(veiculoMock);

      const resultado = await service.findById(veiculoMock.veiculoId);

      expect(resultado.veiculoId).toBe(veiculoMock.veiculoId);
    });

    it('deve lançar NotFoundException quando o veículo não existir', async () => {
      repositoryMock.findById.mockResolvedValue(null);

      await expect(service.findById('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar um veículo existente', async () => {
      repositoryMock.findById.mockResolvedValue(veiculoMock);
      repositoryMock.findByPlaca.mockResolvedValue(null);
      repositoryMock.update.mockResolvedValue({
        ...veiculoMock,
        cor: 'Branco',
      });

      const resultado = await service.update(veiculoMock.veiculoId, {
        cor: 'Branco',
      });

      expect(resultado.cor).toBe('Branco');
    });

    it('deve lançar NotFoundException ao atualizar veículo inexistente', async () => {
      repositoryMock.findById.mockResolvedValue(null);

      await expect(
        service.update('id-inexistente', { cor: 'Branco' }),
      ).rejects.toThrow(NotFoundException);

      expect(repositoryMock.update).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException se a nova placa já pertencer a outro veículo', async () => {
      repositoryMock.findById.mockResolvedValue(veiculoMock);
      repositoryMock.findByPlaca.mockResolvedValue({
        ...veiculoMock,
        veiculoId: 'outro-id',
      });

      await expect(
        service.update(veiculoMock.veiculoId, { placa: 'XYZ9W88' }),
      ).rejects.toThrow(ConflictException);

      expect(repositoryMock.update).not.toHaveBeenCalled();
    });

    it('deve permitir manter a mesma placa do próprio veículo', async () => {
      repositoryMock.findById.mockResolvedValue(veiculoMock);
      repositoryMock.findByPlaca.mockResolvedValue(veiculoMock);
      repositoryMock.update.mockResolvedValue(veiculoMock);

      const resultado = await service.update(veiculoMock.veiculoId, {
        placa: veiculoMock.placa,
      });

      expect(resultado.placa).toBe(veiculoMock.placa);
      expect(repositoryMock.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve fazer soft delete de um veículo existente', async () => {
      repositoryMock.findById.mockResolvedValue(veiculoMock);
      repositoryMock.softDelete.mockResolvedValue({
        ...veiculoMock,
        deletadoEm: new Date(),
      });

      await service.remove(veiculoMock.veiculoId);

      expect(repositoryMock.softDelete).toHaveBeenCalledWith(
        veiculoMock.veiculoId,
      );
    });

    it('deve lançar NotFoundException ao remover veículo inexistente', async () => {
      repositoryMock.findById.mockResolvedValue(null);

      await expect(service.remove('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );

      expect(repositoryMock.softDelete).not.toHaveBeenCalled();
    });
  });
});
