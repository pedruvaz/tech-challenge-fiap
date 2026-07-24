import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Cliente, Tipo } from '@prisma/client';
import { ClienteRepository } from '../cliente.repository';
import { ClienteService } from '../cliente.service';

describe('ClienteService', () => {
  let service: ClienteService;

  const clienteMock: Cliente = {
    clienteId: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    numDocumento: '12345678900',
    nome: 'João da Silva',
    email: null,
    telefone: '11999998888',
    tipo: Tipo.pessoa_fisica,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    deletadoEm: null,
  };

  const repositoryMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByNumDocumento: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClienteService,
        { provide: ClienteRepository, useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<ClienteService>(ClienteService);
  });

  describe('create', () => {
    it('deve criar um cliente', async () => {
      repositoryMock.findByNumDocumento.mockResolvedValue(null);
      repositoryMock.create.mockResolvedValue(clienteMock);

      const resultado = await service.create({
        numDocumento: clienteMock.numDocumento,
        nome: clienteMock.nome,
        telefone: clienteMock.telefone,
        tipo: clienteMock.tipo,
      });

      expect(resultado.numDocumento).toBe(clienteMock.numDocumento);
    });

    it('deve lançar ConflictException se o documento já existir', async () => {
      repositoryMock.findByNumDocumento.mockResolvedValue(clienteMock);

      await expect(
        service.create({
          numDocumento: clienteMock.numDocumento,
          nome: clienteMock.nome,
          telefone: clienteMock.telefone,
          tipo: clienteMock.tipo,
        }),
      ).rejects.toThrow(ConflictException);

      expect(repositoryMock.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar a lista de clientes', async () => {
      repositoryMock.findAll.mockResolvedValue([clienteMock]);

      const resultado = await service.findAll();

      expect(resultado).toHaveLength(1);
      expect(resultado[0].numDocumento).toBe(clienteMock.numDocumento);
    });
  });

  describe('findById', () => {
    it('deve retornar um cliente existente', async () => {
      repositoryMock.findById.mockResolvedValue(clienteMock);

      const resultado = await service.findById(clienteMock.clienteId);

      expect(resultado.clienteId).toBe(clienteMock.clienteId);
    });

    it('deve lançar NotFoundException quando o cliente não existir', async () => {
      repositoryMock.findById.mockResolvedValue(null);

      await expect(service.findById('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar um cliente existente', async () => {
      repositoryMock.findById.mockResolvedValue(clienteMock);
      repositoryMock.findByNumDocumento.mockResolvedValue(null);
      repositoryMock.update.mockResolvedValue({
        ...clienteMock,
        telefone: '11988887777',
      });

      const resultado = await service.update(clienteMock.clienteId, {
        telefone: '11988887777',
      });

      expect(resultado.telefone).toBe('11988887777');
    });

    it('deve lançar NotFoundException ao atualizar cliente inexistente', async () => {
      repositoryMock.findById.mockResolvedValue(null);

      await expect(
        service.update('id-inexistente', { telefone: '11988887777' }),
      ).rejects.toThrow(NotFoundException);

      expect(repositoryMock.update).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException se o novo documento já pertencer a outro cliente', async () => {
      repositoryMock.findById.mockResolvedValue(clienteMock);
      repositoryMock.findByNumDocumento.mockResolvedValue({
        ...clienteMock,
        clienteId: 'outro-id',
      });

      await expect(
        service.update(clienteMock.clienteId, { numDocumento: '99999999999' }),
      ).rejects.toThrow(ConflictException);

      expect(repositoryMock.update).not.toHaveBeenCalled();
    });

    it('deve permitir manter o mesmo documento do próprio cliente', async () => {
      repositoryMock.findById.mockResolvedValue(clienteMock);
      repositoryMock.findByNumDocumento.mockResolvedValue(clienteMock);
      repositoryMock.update.mockResolvedValue(clienteMock);

      const resultado = await service.update(clienteMock.clienteId, {
        numDocumento: clienteMock.numDocumento,
      });

      expect(resultado.numDocumento).toBe(clienteMock.numDocumento);
      expect(repositoryMock.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve fazer soft delete de um cliente existente', async () => {
      repositoryMock.findById.mockResolvedValue(clienteMock);
      repositoryMock.softDelete.mockResolvedValue({
        ...clienteMock,
        deletadoEm: new Date(),
      });

      await service.remove(clienteMock.clienteId);

      expect(repositoryMock.softDelete).toHaveBeenCalledWith(
        clienteMock.clienteId,
      );
    });

    it('deve lançar NotFoundException ao remover cliente inexistente', async () => {
      repositoryMock.findById.mockResolvedValue(null);

      await expect(service.remove('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );

      expect(repositoryMock.softDelete).not.toHaveBeenCalled();
    });
  });
});
