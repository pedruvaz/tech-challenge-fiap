import { Test, TestingModule } from '@nestjs/testing';
import { VeiculoController } from '../veiculo.controller';
import { VeiculoResponseDto } from '../dto/veiculo-response.dto';
import { VeiculoService } from '../veiculo.service';

describe('VeiculoController', () => {
  let controller: VeiculoController;

  const veiculoResponseMock: VeiculoResponseDto = {
    veiculoId: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    placa: 'ABC1D23',
    marca: 'Toyota',
    modelo: 'Corolla',
    ano: '2020',
    cor: 'Preto',
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };

  const serviceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VeiculoController],
      providers: [{ provide: VeiculoService, useValue: serviceMock }],
    }).compile();

    controller = module.get<VeiculoController>(VeiculoController);
  });

  it('deve criar um veículo', async () => {
    serviceMock.create.mockResolvedValue(veiculoResponseMock);

    const resultado = await controller.create({
      placa: veiculoResponseMock.placa,
      marca: veiculoResponseMock.marca,
      modelo: veiculoResponseMock.modelo,
      ano: veiculoResponseMock.ano,
      cor: veiculoResponseMock.cor,
      clienteId: '6a3bd4e0-db9d-4b9a-bb1a-c63dabfa89d2',
    });

    expect(serviceMock.create).toHaveBeenCalled();
    expect(resultado).toEqual(veiculoResponseMock);
  });

  it('deve listar veículos', async () => {
    serviceMock.findAll.mockResolvedValue([veiculoResponseMock]);

    const resultado = await controller.findAll();

    expect(resultado).toEqual([veiculoResponseMock]);
  });

  it('deve buscar um veículo pelo id', async () => {
    serviceMock.findById.mockResolvedValue(veiculoResponseMock);

    const resultado = await controller.findOne(veiculoResponseMock.veiculoId);

    expect(serviceMock.findById).toHaveBeenCalledWith(
      veiculoResponseMock.veiculoId,
    );
    expect(resultado).toEqual(veiculoResponseMock);
  });

  it('deve atualizar um veículo', async () => {
    const atualizado = { ...veiculoResponseMock, cor: 'Branco' };
    serviceMock.update.mockResolvedValue(atualizado);

    const resultado = await controller.update(veiculoResponseMock.veiculoId, {
      cor: 'Branco',
    });

    expect(serviceMock.update).toHaveBeenCalledWith(
      veiculoResponseMock.veiculoId,
      { cor: 'Branco' },
    );
    expect(resultado).toEqual(atualizado);
  });

  it('deve remover (soft delete) um veículo', async () => {
    serviceMock.remove.mockResolvedValue(undefined);

    await controller.remove(veiculoResponseMock.veiculoId);

    expect(serviceMock.remove).toHaveBeenCalledWith(
      veiculoResponseMock.veiculoId,
    );
  });
});
