import { Test, TestingModule } from '@nestjs/testing';
import { Cliente, Tipo } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ClienteRepository } from '../cliente.repository';

describe('ClienteRepository', () => {
  let repository: ClienteRepository;

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

  const prismaMock = {
    cliente: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClienteRepository,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    repository = module.get<ClienteRepository>(ClienteRepository);
  });

  it('deve criar um cliente', async () => {
    prismaMock.cliente.create.mockResolvedValue(clienteMock);

    const resultado = await repository.create({
      numDocumento: clienteMock.numDocumento,
      nome: clienteMock.nome,
      telefone: clienteMock.telefone,
      tipo: clienteMock.tipo,
    });

    expect(prismaMock.cliente.create).toHaveBeenCalledWith({
      data: {
        numDocumento: clienteMock.numDocumento,
        nome: clienteMock.nome,
        telefone: clienteMock.telefone,
        tipo: clienteMock.tipo,
      },
    });
    expect(resultado).toEqual(clienteMock);
  });

  it('deve listar clientes não deletados', async () => {
    prismaMock.cliente.findMany.mockResolvedValue([clienteMock]);

    const resultado = await repository.findAll();

    expect(prismaMock.cliente.findMany).toHaveBeenCalledWith({
      where: { deletadoEm: null },
      orderBy: { clienteId: 'asc' },
    });
    expect(resultado).toEqual([clienteMock]);
  });

  it('deve buscar um cliente por id', async () => {
    prismaMock.cliente.findFirst.mockResolvedValue(clienteMock);

    const resultado = await repository.findById(clienteMock.clienteId);

    expect(prismaMock.cliente.findFirst).toHaveBeenCalledWith({
      where: { clienteId: clienteMock.clienteId, deletadoEm: null },
    });
    expect(resultado).toEqual(clienteMock);
  });

  it('deve retornar null quando o cliente não existir', async () => {
    prismaMock.cliente.findFirst.mockResolvedValue(null);

    const resultado = await repository.findById('id-inexistente');

    expect(resultado).toBeNull();
  });

  it('deve buscar um cliente por número de documento', async () => {
    prismaMock.cliente.findFirst.mockResolvedValue(clienteMock);

    const resultado = await repository.findByNumDocumento(
      clienteMock.numDocumento,
    );

    expect(prismaMock.cliente.findFirst).toHaveBeenCalledWith({
      where: { numDocumento: clienteMock.numDocumento, deletadoEm: null },
    });
    expect(resultado).toEqual(clienteMock);
  });

  it('deve atualizar um cliente', async () => {
    const clienteAtualizado = { ...clienteMock, telefone: '11988887777' };
    prismaMock.cliente.update.mockResolvedValue(clienteAtualizado);

    const resultado = await repository.update(clienteMock.clienteId, {
      telefone: '11988887777',
    });

    expect(prismaMock.cliente.update).toHaveBeenCalledWith({
      where: { clienteId: clienteMock.clienteId },
      data: { telefone: '11988887777' },
    });
    expect(resultado).toEqual(clienteAtualizado);
  });

  it('deve fazer soft delete de um cliente', async () => {
    const clienteDeletado = { ...clienteMock, deletadoEm: new Date() };
    let argumentoRecebido:
      | { where: { clienteId: string }; data: { deletadoEm: Date } }
      | undefined;
    prismaMock.cliente.update.mockImplementation(
      (args: typeof argumentoRecebido) => {
        argumentoRecebido = args;
        return Promise.resolve(clienteDeletado);
      },
    );

    const resultado = await repository.softDelete(clienteMock.clienteId);

    expect(argumentoRecebido?.where).toEqual({
      clienteId: clienteMock.clienteId,
    });
    expect(argumentoRecebido?.data.deletadoEm).toBeInstanceOf(Date);
    expect(resultado.deletadoEm).not.toBeNull();
  });
});
