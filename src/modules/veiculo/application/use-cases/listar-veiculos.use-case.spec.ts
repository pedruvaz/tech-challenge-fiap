import { Veiculo } from '../../domain/entities/veiculo.entity';
import { VeiculoRepository } from '../../domain/repositories/veiculo.repository';
import { ListarVeiculosUseCase } from './listar-veiculos.use-case';

describe('ListarVeiculosUseCase', () => {
  it('delega a listagem ao repositório', async () => {
    const veiculos = [
      Veiculo.criar({
        veiculoId: 'v1',
        placa: 'ABC1D23',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: '2020',
        cor: 'Preto',
        clienteProprietarioId: 'c1',
      }),
    ];
    const repo = {
      salvar: jest.fn(),
      buscarPorId: jest.fn(),
      listar: jest.fn().mockResolvedValue(veiculos),
      existeComPlaca: jest.fn(),
    } as unknown as VeiculoRepository;

    await expect(new ListarVeiculosUseCase(repo).executar()).resolves.toBe(
      veiculos,
    );
    expect(repo.listar).toHaveBeenCalledTimes(1);
  });

  it('devolve lista vazia quando não há veículos', async () => {
    const repo = {
      salvar: jest.fn(),
      buscarPorId: jest.fn(),
      listar: jest.fn().mockResolvedValue([]),
      existeComPlaca: jest.fn(),
    } as unknown as VeiculoRepository;

    await expect(new ListarVeiculosUseCase(repo).executar()).resolves.toEqual(
      [],
    );
  });
});
