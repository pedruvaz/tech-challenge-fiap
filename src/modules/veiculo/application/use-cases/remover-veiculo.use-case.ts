import { VeiculoNaoEncontradoException } from '../../domain/exceptions/veiculo-nao-encontrado.exception';
import { VeiculoRepository } from '../../domain/repositories/veiculo.repository';

export class RemoverVeiculoUseCase {
  constructor(private readonly repo: VeiculoRepository) {}

  async executar(veiculoId: string): Promise<void> {
    const veiculo = await this.repo.buscarPorId(veiculoId);
    if (!veiculo) throw new VeiculoNaoEncontradoException(veiculoId);

    veiculo.softDelete();
    await this.repo.salvar(veiculo);
  }
}
