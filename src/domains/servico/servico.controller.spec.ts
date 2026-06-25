import { Test, TestingModule } from '@nestjs/testing';
import { ServicoController } from './servico.controller';
import { ServicoService } from './servico.service';

describe('ServicoController', () => {
  let controller: ServicoController;

  const servicoMock = {
    servicoId: 1,
    descricao: 'Troca de óleo',
    valor: 150.0,
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
      controllers: [ServicoController],
      providers: [{ provide: ServicoService, useValue: serviceMock }],
    }).compile();

    controller = module.get<ServicoController>(ServicoController);
  });

  it('deve criar um serviço', async () => {
    serviceMock.create.mockResolvedValue(servicoMock);

    const resultado = await controller.create({
      descricao: servicoMock.descricao,
      valor: servicoMock.valor,
    });

    expect(serviceMock.create).toHaveBeenCalled();
    expect(resultado).toEqual(servicoMock);
  });

  it('deve listar serviços', async () => {
    serviceMock.findAll.mockResolvedValue([servicoMock]);

    const resultado = await controller.findAll();

    expect(resultado).toEqual([servicoMock]);
  });

  it('deve buscar um serviço pelo id', async () => {
    serviceMock.findOne.mockResolvedValue(servicoMock);

    const resultado = await controller.findOne('1');

    expect(serviceMock.findOne).toHaveBeenCalledWith(1);
    expect(resultado).toEqual(servicoMock);
  });

  it('deve atualizar um serviço', async () => {
    const atualizado = { ...servicoMock, descricao: 'Alinhamento' };
    serviceMock.update.mockResolvedValue(atualizado);

    const resultado = await controller.update('1', {
      descricao: 'Alinhamento',
    });

    expect(serviceMock.update).toHaveBeenCalledWith(1, {
      descricao: 'Alinhamento',
    });
    expect(resultado.descricao).toBe('Alinhamento');
  });

  it('deve remover um serviço', async () => {
    serviceMock.remove.mockResolvedValue(servicoMock);

    const resultado = await controller.remove('1');

    expect(serviceMock.remove).toHaveBeenCalledWith(1);
    expect(resultado).toEqual(servicoMock);
  });
});
