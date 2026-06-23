import { Test, TestingModule } from '@nestjs/testing';
import { Veiculo } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { VeiculoRepository } from '../veiculo.repository';

describe('VeiculoRepository', () => {
  let repository: VeiculoRepository;

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

  const prismaMock = {
    veiculo: {
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
        VeiculoRepository,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    repository = module.get<VeiculoRepository>(VeiculoRepository);
  });

  it('deve criar um veículo', async () => {
    prismaMock.veiculo.create.mockResolvedValue(veiculoMock);

    const resultado = await repository.create({
      placa: veiculoMock.placa,
      marca: veiculoMock.marca,
      modelo: veiculoMock.modelo,
      ano: veiculoMock.ano,
      cor: veiculoMock.cor,
    });

    expect(prismaMock.veiculo.create).toHaveBeenCalledWith({
      data: {
        placa: veiculoMock.placa,
        marca: veiculoMock.marca,
        modelo: veiculoMock.modelo,
        ano: veiculoMock.ano,
        cor: veiculoMock.cor,
      },
    });
    expect(resultado).toEqual(veiculoMock);
  });

  it('deve listar veículos não deletados', async () => {
    prismaMock.veiculo.findMany.mockResolvedValue([veiculoMock]);

    const resultado = await repository.findAll();

    expect(prismaMock.veiculo.findMany).toHaveBeenCalledWith({
      where: { deletadoEm: null },
      orderBy: { veiculoId: 'asc' },
    });
    expect(resultado).toEqual([veiculoMock]);
  });

  it('deve buscar um veículo por id', async () => {
    prismaMock.veiculo.findFirst.mockResolvedValue(veiculoMock);

    const resultado = await repository.findById(veiculoMock.veiculoId);

    expect(prismaMock.veiculo.findFirst).toHaveBeenCalledWith({
      where: { veiculoId: veiculoMock.veiculoId, deletadoEm: null },
    });
    expect(resultado).toEqual(veiculoMock);
  });

  it('deve retornar null quando o veículo não existir', async () => {
    prismaMock.veiculo.findFirst.mockResolvedValue(null);

    const resultado = await repository.findById('id-inexistente');

    expect(resultado).toBeNull();
  });

  it('deve buscar um veículo por placa', async () => {
    prismaMock.veiculo.findFirst.mockResolvedValue(veiculoMock);

    const resultado = await repository.findByPlaca(veiculoMock.placa);

    expect(prismaMock.veiculo.findFirst).toHaveBeenCalledWith({
      where: { placa: veiculoMock.placa, deletadoEm: null },
    });
    expect(resultado).toEqual(veiculoMock);
  });

  it('deve atualizar um veículo', async () => {
    const veiculoAtualizado = { ...veiculoMock, cor: 'Branco' };
    prismaMock.veiculo.update.mockResolvedValue(veiculoAtualizado);

    const resultado = await repository.update(veiculoMock.veiculoId, {
      cor: 'Branco',
    });

    expect(prismaMock.veiculo.update).toHaveBeenCalledWith({
      where: { veiculoId: veiculoMock.veiculoId },
      data: { cor: 'Branco' },
    });
    expect(resultado).toEqual(veiculoAtualizado);
  });

  it('deve fazer soft delete de um veículo', async () => {
    const veiculoDeletado = { ...veiculoMock, deletadoEm: new Date() };
    let argumentoRecebido:
      | { where: { veiculoId: string }; data: { deletadoEm: Date } }
      | undefined;
    prismaMock.veiculo.update.mockImplementation(
      (args: typeof argumentoRecebido) => {
        argumentoRecebido = args;
        return Promise.resolve(veiculoDeletado);
      },
    );

    const resultado = await repository.softDelete(veiculoMock.veiculoId);

    expect(argumentoRecebido?.where).toEqual({
      veiculoId: veiculoMock.veiculoId,
    });
    expect(argumentoRecebido?.data.deletadoEm).toBeInstanceOf(Date);
    expect(resultado.deletadoEm).not.toBeNull();
  });
});
