import { Veiculo } from '../../domain/entities/veiculo.entity';
import { VeiculoNaoEncontradoException } from '../../domain/exceptions/veiculo-nao-encontrado.exception';
import { VeiculoRepository } from '../../domain/repositories/veiculo.repository';
import { RemoverVeiculoUseCase } from './remover-veiculo.use-case';

const repoCom = (veiculo: Veiculo | null): VeiculoRepository => ({
  salvar: jest.fn().mockResolvedValue(undefined),
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

describe('RemoverVeiculoUseCase', () => {
  it('faz soft delete e persiste o veículo', async () => {
    const veiculo = veiculoExistente();
    const repo = repoCom(veiculo);

    await new RemoverVeiculoUseCase(repo).executar('v1');

    expect(veiculo.deletadoEm).toBeInstanceOf(Date);
    expect(repo.salvar).toHaveBeenCalledWith(veiculo);
  });

  it('lança VeiculoNaoEncontradoException e não salva quando não existe', async () => {
    const repo = repoCom(null);

    await expect(
      new RemoverVeiculoUseCase(repo).executar('inexistente'),
    ).rejects.toThrow(VeiculoNaoEncontradoException);
    expect(repo.salvar).not.toHaveBeenCalled();
  });
});
