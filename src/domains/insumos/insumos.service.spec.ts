import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InsumosRepository } from './repositories/insumos.repository';
import { InsumosService } from './insumos.service';

describe('InsumosService', () => {
  let service: InsumosService;

  const insumoMock = {
    insumoId: 1,
    nome: 'Óleo de motor',
    qtdEstoque: 10,
    valorUn: 49.9,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    deletadoEm: null,
  };

  const repositoryMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsumosService,
        { provide: InsumosRepository, useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<InsumosService>(InsumosService);
  });

  describe('create', () => {
    it('deve criar um insumo', async () => {
      repositoryMock.create.mockResolvedValue(insumoMock);

      const resultado = await service.create({
        nome: insumoMock.nome,
        qtdEstoque: insumoMock.qtdEstoque,
        valorUn: insumoMock.valorUn,
      });

      expect(repositoryMock.create).toHaveBeenCalled();
      expect(resultado.nome).toBe(insumoMock.nome);
    });
  });

  describe('findAll', () => {
    it('deve retornar a lista de insumos', async () => {
      repositoryMock.findAll.mockResolvedValue([insumoMock]);

      const resultado = await service.findAll();

      expect(resultado).toHaveLength(1);
      expect(resultado[0].insumoId).toBe(insumoMock.insumoId);
    });
  });

  describe('findOne', () => {
    it('deve retornar um insumo pelo id', async () => {
      repositoryMock.findOne.mockResolvedValue(insumoMock);

      const resultado = await service.findOne(1);

      expect(repositoryMock.findOne).toHaveBeenCalledWith(1);
      expect(resultado.insumoId).toBe(1);
    });

    it('deve lançar NotFoundException quando o insumo não existir', async () => {
      repositoryMock.findOne.mockRejectedValue(
        new NotFoundException('Insumo não encontrado.'),
      );

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar um insumo', async () => {
      const atualizado = { ...insumoMock, nome: 'Óleo sintético' };
      repositoryMock.update.mockResolvedValue(atualizado);

      const resultado = await service.update(1, { nome: 'Óleo sintético' });

      expect(repositoryMock.update).toHaveBeenCalledWith(1, {
        nome: 'Óleo sintético',
      });
      expect(resultado.nome).toBe('Óleo sintético');
    });
  });

  describe('remove', () => {
    it('deve remover um insumo', async () => {
      repositoryMock.remove.mockResolvedValue(insumoMock);

      const resultado = await service.remove(1);

      expect(repositoryMock.remove).toHaveBeenCalledWith(1);
      expect(resultado).toEqual(insumoMock);
    });
  });
});
