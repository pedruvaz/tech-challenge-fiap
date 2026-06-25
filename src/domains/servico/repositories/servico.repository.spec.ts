import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma/prisma.service';
import { ServicoRepository } from './servico.repository';

describe('ServicoRepository', () => {
  let repository: ServicoRepository;

  const servicoMock = {
    servicoId: 1,
    descricao: 'Troca de óleo',
    valor: 150.0,
  };

  const prismaMock = {
    servico: {
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
        ServicoRepository,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    repository = module.get<ServicoRepository>(ServicoRepository);
  });

  it('deve criar um serviço', async () => {
    prismaMock.servico.create.mockResolvedValue(servicoMock);

    const resultado = await repository.create({
      descricao: servicoMock.descricao,
      valor: servicoMock.valor,
    });

    expect(prismaMock.servico.create).toHaveBeenCalledWith({
      data: {
        descricao: servicoMock.descricao,
        valor: servicoMock.valor,
      },
    });
    expect(resultado).toEqual(servicoMock);
  });

  it('deve listar todos os serviços', async () => {
    prismaMock.servico.findMany.mockResolvedValue([servicoMock]);

    const resultado = await repository.findAll();

    expect(prismaMock.servico.findMany).toHaveBeenCalled();
    expect(resultado).toEqual([servicoMock]);
  });

  it('deve retornar um serviço pelo id', async () => {
    prismaMock.servico.findUnique.mockResolvedValue(servicoMock);

    const resultado = await repository.findOne(1);

    expect(prismaMock.servico.findUnique).toHaveBeenCalledWith({
      where: { servicoId: 1 },
    });
    expect(resultado).toEqual(servicoMock);
  });

  it('deve lançar NotFoundException quando o serviço não existir', async () => {
    prismaMock.servico.findUnique.mockResolvedValue(null);

    await expect(repository.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('deve atualizar um serviço', async () => {
    const atualizado = { ...servicoMock, descricao: 'Alinhamento' };
    prismaMock.servico.update.mockResolvedValue(atualizado);

    const resultado = await repository.update(1, { descricao: 'Alinhamento' });

    expect(prismaMock.servico.update).toHaveBeenCalledWith({
      where: { servicoId: 1 },
      data: { descricao: 'Alinhamento' },
    });
    expect(resultado.descricao).toBe('Alinhamento');
  });

  it('deve remover um serviço', async () => {
    prismaMock.servico.delete.mockResolvedValue(servicoMock);

    const resultado = await repository.remove(1);

    expect(prismaMock.servico.delete).toHaveBeenCalledWith({
      where: { servicoId: 1 },
    });
    expect(resultado).toEqual(servicoMock);
  });
});
