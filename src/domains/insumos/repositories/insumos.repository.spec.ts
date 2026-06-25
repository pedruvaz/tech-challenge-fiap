import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma/prisma.service';
import { InsumosRepository } from './insumos.repository';

describe('InsumosRepository', () => {
  let repository: InsumosRepository;

  const insumoMock = {
    insumoId: 1,
    nome: 'Óleo de motor',
    qtdEstoque: 10,
    valorUn: 49.9,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    deletadoEm: null,
  };

  const prismaMock = {
    insumo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsumosRepository,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    repository = module.get<InsumosRepository>(InsumosRepository);
  });

  it('deve criar um insumo', async () => {
    prismaMock.insumo.create.mockResolvedValue(insumoMock);

    const resultado = await repository.create({
      nome: insumoMock.nome,
      qtdEstoque: insumoMock.qtdEstoque,
      valorUn: insumoMock.valorUn,
    });

    expect(prismaMock.insumo.create).toHaveBeenCalledWith({
      data: {
        nome: insumoMock.nome,
        qtdEstoque: insumoMock.qtdEstoque,
        valorUn: insumoMock.valorUn,
      },
    });
    expect(resultado).toEqual(insumoMock);
  });

  it('deve listar todos os insumos', async () => {
    prismaMock.insumo.findMany.mockResolvedValue([insumoMock]);

    const resultado = await repository.findAll();

    expect(prismaMock.insumo.findMany).toHaveBeenCalled();
    expect(resultado).toEqual([insumoMock]);
  });

  it('deve retornar um insumo pelo id', async () => {
    prismaMock.insumo.findUnique.mockResolvedValue(insumoMock);

    const resultado = await repository.findOne(1);

    expect(prismaMock.insumo.findUnique).toHaveBeenCalledWith({
      where: { insumoId: 1 },
    });
    expect(resultado).toEqual(insumoMock);
  });

  it('deve lançar NotFoundException quando o insumo não existir', async () => {
    prismaMock.insumo.findUnique.mockResolvedValue(null);

    await expect(repository.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('deve atualizar um insumo', async () => {
    const atualizado = { ...insumoMock, nome: 'Óleo sintético' };
    prismaMock.insumo.update.mockResolvedValue(atualizado);

    const resultado = await repository.update(1, { nome: 'Óleo sintético' });

    expect(prismaMock.insumo.update).toHaveBeenCalledWith({
      where: { insumoId: 1 },
      data: { nome: 'Óleo sintético' },
    });
    expect(resultado.nome).toBe('Óleo sintético');
  });

  it('deve remover um insumo', async () => {
    prismaMock.insumo.delete.mockResolvedValue(insumoMock);

    const resultado = await repository.remove(1);

    expect(prismaMock.insumo.delete).toHaveBeenCalledWith({
      where: { insumoId: 1 },
    });
    expect(resultado).toEqual(insumoMock);
  });
});
