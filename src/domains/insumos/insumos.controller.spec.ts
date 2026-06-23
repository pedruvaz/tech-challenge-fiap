import { Test, TestingModule } from '@nestjs/testing';
import { InsumosController } from './insumos.controller';
import { InsumosService } from './insumos.service';

describe('InsumosController', () => {
  let controller: InsumosController;

  const insumoMock = {
    insumoId: 1,
    nome: 'Óleo de motor',
    qtdEstoque: 10,
    valorUn: 49.9,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    deletadoEm: null,
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
      controllers: [InsumosController],
      providers: [{ provide: InsumosService, useValue: serviceMock }],
    }).compile();

    controller = module.get<InsumosController>(InsumosController);
  });

  it('deve criar um insumo', async () => {
    serviceMock.create.mockResolvedValue(insumoMock);

    const resultado = await controller.create({
      nome: insumoMock.nome,
      qtdEstoque: insumoMock.qtdEstoque,
      valorUn: insumoMock.valorUn,
    });

    expect(serviceMock.create).toHaveBeenCalled();
    expect(resultado).toEqual(insumoMock);
  });

  it('deve listar insumos', async () => {
    serviceMock.findAll.mockResolvedValue([insumoMock]);

    const resultado = await controller.findAll();

    expect(resultado).toEqual([insumoMock]);
  });

  it('deve buscar um insumo pelo id', async () => {
    serviceMock.findOne.mockResolvedValue(insumoMock);

    const resultado = await controller.findOne('1');

    expect(serviceMock.findOne).toHaveBeenCalledWith(1);
    expect(resultado).toEqual(insumoMock);
  });

  it('deve atualizar um insumo', async () => {
    const atualizado = { ...insumoMock, nome: 'Óleo sintético' };
    serviceMock.update.mockResolvedValue(atualizado);

    const resultado = await controller.update('1', { nome: 'Óleo sintético' });

    expect(serviceMock.update).toHaveBeenCalledWith(1, {
      nome: 'Óleo sintético',
    });
    expect(resultado.nome).toBe('Óleo sintético');
  });

  it('deve remover um insumo', async () => {
    serviceMock.remove.mockResolvedValue(insumoMock);

    const resultado = await controller.remove('1');

    expect(serviceMock.remove).toHaveBeenCalledWith(1);
    expect(resultado).toEqual(insumoMock);
  });
});
