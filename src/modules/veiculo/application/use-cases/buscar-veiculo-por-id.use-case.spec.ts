import { Veiculo } from '../../domain/entities/veiculo.entity';
import { VeiculoNaoEncontradoException } from '../../domain/exceptions/veiculo-nao-encontrado.exception';
import { VeiculoRepository } from '../../domain/repositories/veiculo.repository';
import { BuscarVeiculoPorIdUseCase } from './buscar-veiculo-por-id.use-case';

const repoCom = (veiculo: Veiculo | null): VeiculoRepository => ({
  salvar: jest.fn(),
  buscarPorId: jest.fn().mockResolvedValue(veiculo),
  listar: jest.fn(),
  existeComPlaca: jest.fn(),
});

const veiculoExistente = (): Veiculo =>
  Veiculo.criar({
    veiculoId: 'v1',
    placa: 'ABC1D23',
    marca: 'Toyota',
    modelo: 'Corolla',
    ano: '2020',
    cor: 'Preto',
    clienteProprietarioId: 'c1',
  });

describe('BuscarVeiculoPorIdUseCase', () => {
  it('devolve o veículo encontrado', async () => {
    const veiculo = veiculoExistente();
    const repo = repoCom(veiculo);

    await expect(
      new BuscarVeiculoPorIdUseCase(repo).executar('v1'),
    ).resolves.toBe(veiculo);
    expect(repo.buscarPorId).toHaveBeenCalledWith('v1');
  });

  it('lança VeiculoNaoEncontradoException quando não existe', async () => {
    const repo = repoCom(null);

    await expect(
      new BuscarVeiculoPorIdUseCase(repo).executar('inexistente'),
    ).rejects.toThrow(VeiculoNaoEncontradoException);
  });
});
