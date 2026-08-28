import { Test, TestingModule } from '@nestjs/testing';
import { Tipo } from '@prisma/client';
import { ClienteController } from '../cliente.controller';
import { ClienteResponseDto } from '../dto/cliente-response.dto';
import { ClienteService } from '../cliente.service';

describe('ClienteController', () => {
  let controller: ClienteController;

  const clienteResponseMock: ClienteResponseDto = {
    clienteId: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    numDocumento: '12345678900',
    nome: 'João da Silva',
    email: null,
    telefone: '11999998888',
    tipo: Tipo.pessoa_fisica,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };

  const serviceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClienteController],
      providers: [{ provide: ClienteService, useValue: serviceMock }],
    }).compile();

    controller = module.get<ClienteController>(ClienteController);
  });

  it('deve criar um cliente', async () => {
    serviceMock.create.mockResolvedValue(clienteResponseMock);

    const resultado = await controller.create({
      numDocumento: clienteResponseMock.numDocumento,
      nome: clienteResponseMock.nome,
      telefone: clienteResponseMock.telefone,
      tipo: clienteResponseMock.tipo,
    });

    expect(serviceMock.create).toHaveBeenCalled();
    expect(resultado).toEqual(clienteResponseMock);
  });

  it('deve listar clientes', async () => {
    serviceMock.findAll.mockResolvedValue([clienteResponseMock]);

    const resultado = await controller.findAll();

    expect(resultado).toEqual([clienteResponseMock]);
  });

  it('deve buscar um cliente pelo id', async () => {
    serviceMock.findById.mockResolvedValue(clienteResponseMock);

    const resultado = await controller.findOne(clienteResponseMock.clienteId);

    expect(serviceMock.findById).toHaveBeenCalledWith(
      clienteResponseMock.clienteId,
    );
    expect(resultado).toEqual(clienteResponseMock);
  });

  it('deve atualizar um cliente', async () => {
    const atualizado = { ...clienteResponseMock, telefone: '11988887777' };
    serviceMock.update.mockResolvedValue(atualizado);

    const resultado = await controller.update(clienteResponseMock.clienteId, {
      telefone: '11988887777',
    });

    expect(serviceMock.update).toHaveBeenCalledWith(
      clienteResponseMock.clienteId,
      { telefone: '11988887777' },
    );
    expect(resultado).toEqual(atualizado);
  });

  it('deve remover (soft delete) um cliente', async () => {
    serviceMock.remove.mockResolvedValue(undefined);

    await controller.remove(clienteResponseMock.clienteId);

    expect(serviceMock.remove).toHaveBeenCalledWith(
      clienteResponseMock.clienteId,
    );
  });
});
