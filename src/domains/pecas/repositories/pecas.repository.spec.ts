import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma/prisma.service';
import { PecasRepository } from './pecas.repository';

describe('PecasRepository', () => {
  let repository: PecasRepository;

  const pecaMock = {
    pecaId: 1,
    nome: 'Filtro de ar',
    qtdEstoque: 5,
    valorUn: 29.9,
  };

  const prismaMock = {
    peca: {
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
        PecasRepository,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    repository = module.get<PecasRepository>(PecasRepository);
  });

  it('deve criar uma peça', async () => {
    prismaMock.peca.create.mockResolvedValue(pecaMock);

    const resultado = await repository.create({
      nome: pecaMock.nome,
      qtdEstoque: pecaMock.qtdEstoque,
      valorUn: pecaMock.valorUn,
    });

    expect(prismaMock.peca.create).toHaveBeenCalledWith({
      data: {
        nome: pecaMock.nome,
        qtdEstoque: pecaMock.qtdEstoque,
        valorUn: pecaMock.valorUn,
      },
    });
    expect(resultado).toEqual(pecaMock);
  });

  it('deve listar todas as peças', async () => {
    prismaMock.peca.findMany.mockResolvedValue([pecaMock]);

    const resultado = await repository.findAll();

    expect(prismaMock.peca.findMany).toHaveBeenCalled();
    expect(resultado).toEqual([pecaMock]);
  });

  it('deve retornar uma peça pelo id', async () => {
    prismaMock.peca.findUnique.mockResolvedValue(pecaMock);

    const resultado = await repository.findOne(1);

    expect(prismaMock.peca.findUnique).toHaveBeenCalledWith({
      where: { pecaId: 1 },
    });
    expect(resultado).toEqual(pecaMock);
  });

  it('deve retornar null quando a peça não existir', async () => {
    prismaMock.peca.findUnique.mockResolvedValue(null);

    const resultado = await repository.findOne(999);

    expect(resultado).toBeNull();
  });

  it('deve atualizar uma peça', async () => {
    const atualizado = { ...pecaMock, nome: 'Filtro de óleo' };
    prismaMock.peca.update.mockResolvedValue(atualizado);

    const resultado = await repository.update(1, { nome: 'Filtro de óleo' });

    expect(prismaMock.peca.update).toHaveBeenCalledWith({
      where: { pecaId: 1 },
      data: { nome: 'Filtro de óleo' },
    });
    expect(resultado.nome).toBe('Filtro de óleo');
  });

  it('deve remover uma peça', async () => {
    prismaMock.peca.delete.mockResolvedValue(pecaMock);

    const resultado = await repository.remove(1);

    expect(prismaMock.peca.delete).toHaveBeenCalledWith({
      where: { pecaId: 1 },
    });
    expect(resultado).toEqual(pecaMock);
  });
});
