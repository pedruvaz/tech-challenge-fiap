import { Test, TestingModule } from '@nestjs/testing';
import { PecasController } from './pecas.controller';
import { PecasService } from './pecas.service';

describe('PecasController', () => {
  let controller: PecasController;

  const pecaMock = {
    pecaId: 1,
    nome: 'Filtro de ar',
    qtdEstoque: 5,
    valorUn: 29.9,
  };

  const serviceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PecasController],
      providers: [{ provide: PecasService, useValue: serviceMock }],
    }).compile();

    controller = module.get<PecasController>(PecasController);
  });

  it('deve criar uma peça', async () => {
    serviceMock.create.mockResolvedValue(pecaMock);

    const resultado = await controller.create({
      nome: pecaMock.nome,
      qtdEstoque: pecaMock.qtdEstoque,
      valorUn: pecaMock.valorUn,
    });

    expect(serviceMock.create).toHaveBeenCalled();
    expect(resultado).toEqual(pecaMock);
  });

  it('deve listar peças', async () => {
    serviceMock.findAll.mockResolvedValue([pecaMock]);

    const resultado = await controller.findAll();

    expect(resultado).toEqual([pecaMock]);
  });

  it('deve buscar uma peça pelo id', async () => {
    serviceMock.findOne.mockResolvedValue(pecaMock);

    const resultado = await controller.findOne('1');

    expect(serviceMock.findOne).toHaveBeenCalledWith(1);
    expect(resultado).toEqual(pecaMock);
  });

  it('deve atualizar uma peça', async () => {
    const atualizado = { ...pecaMock, nome: 'Filtro de óleo' };
    serviceMock.update.mockResolvedValue(atualizado);

    const resultado = await controller.update('1', { nome: 'Filtro de óleo' });

    expect(serviceMock.update).toHaveBeenCalledWith(1, {
      nome: 'Filtro de óleo',
    });
    expect(resultado.nome).toBe('Filtro de óleo');
  });

  it('deve remover uma peça', async () => {
    serviceMock.remove.mockResolvedValue(pecaMock);

    const resultado = await controller.remove('1');

    expect(serviceMock.remove).toHaveBeenCalledWith(1);
    expect(resultado).toEqual(pecaMock);
  });
});
