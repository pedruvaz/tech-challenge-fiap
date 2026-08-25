import { Veiculo } from '../../domain/entities/veiculo.entity';
import { VeiculoNaoEncontradoException } from '../../domain/exceptions/veiculo-nao-encontrado.exception';
import { VeiculoRepository } from '../../domain/repositories/veiculo.repository';

export class BuscarVeiculoPorIdUseCase {
  constructor(private readonly repo: VeiculoRepository) {}

  async executar(veiculoId: string): Promise<Veiculo> {
    const veiculo = await this.repo.buscarPorId(veiculoId);
    if (!veiculo) throw new VeiculoNaoEncontradoException(veiculoId);
    return veiculo;
  }
}
