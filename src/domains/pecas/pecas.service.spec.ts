import { Test, TestingModule } from '@nestjs/testing';
import { PecasService } from './pecas.service';
import { PecasRepository } from './repositories/pecas.repository';

describe('PecasService', () => {
  let service: PecasService;

  const pecaMock = {
    pecaId: 1,
    nome: 'Filtro de ar',
    qtdEstoque: 5,
    valorUn: 29.9,
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
        PecasService,
        { provide: PecasRepository, useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<PecasService>(PecasService);
  });

  describe('create', () => {
    it('deve criar uma peça', async () => {
      repositoryMock.create.mockResolvedValue(pecaMock);

      const resultado = await service.create({
        nome: pecaMock.nome,
        qtdEstoque: pecaMock.qtdEstoque,
        valorUn: pecaMock.valorUn,
      });

      expect(repositoryMock.create).toHaveBeenCalled();
      expect(resultado.nome).toBe(pecaMock.nome);
    });
  });

  describe('findAll', () => {
    it('deve retornar a lista de peças', async () => {
      repositoryMock.findAll.mockResolvedValue([pecaMock]);

      const resultado = await service.findAll();

      expect(resultado).toHaveLength(1);
      expect(resultado[0].pecaId).toBe(pecaMock.pecaId);
    });
  });

  describe('findOne', () => {
    it('deve retornar uma peça pelo id', async () => {
      repositoryMock.findOne.mockResolvedValue(pecaMock);

      const resultado = await service.findOne(1);

      expect(repositoryMock.findOne).toHaveBeenCalledWith(1);
      expect(resultado!.pecaId).toBe(1);
    });

    it('deve propagar erro quando a peça não existir', async () => {
      repositoryMock.findOne.mockResolvedValue(null);

      const resultado = await service.findOne(999);

      expect(resultado).toBeNull();
    });
  });

  describe('update', () => {
    it('deve atualizar uma peça', async () => {
      const atualizado = { ...pecaMock, nome: 'Filtro de óleo' };
      repositoryMock.update.mockResolvedValue(atualizado);

      const resultado = await service.update(1, { nome: 'Filtro de óleo' });

      expect(repositoryMock.update).toHaveBeenCalledWith(1, {
        nome: 'Filtro de óleo',
      });
      expect(resultado.nome).toBe('Filtro de óleo');
    });
  });

  describe('remove', () => {
    it('deve remover uma peça', async () => {
      repositoryMock.remove.mockResolvedValue(pecaMock);

      const resultado = await service.remove(1);

      expect(repositoryMock.remove).toHaveBeenCalledWith(1);
      expect(resultado).toEqual(pecaMock);
    });
  });
});
