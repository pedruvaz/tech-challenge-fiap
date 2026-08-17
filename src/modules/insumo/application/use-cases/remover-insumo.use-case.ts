import { InsumoNaoEncontradoException } from '../../domain/exceptions/insumo-nao-encontrado.exception';
import { InsumoRepository } from '../../domain/repositories/insumo.repository';

export class RemoverInsumoUseCase {
  constructor(private readonly repo: InsumoRepository) {}

  async executar(insumoId: number): Promise<void> {
    const insumo = await this.repo.buscarPorId(insumoId);
    if (!insumo) throw new InsumoNaoEncontradoException(insumoId);

    insumo.softDelete();
    await this.repo.salvar(insumo);
  }
}
