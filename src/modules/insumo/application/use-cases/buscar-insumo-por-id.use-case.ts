import { Insumo } from '../../domain/entities/insumo.entity';
import { InsumoNaoEncontradoException } from '../../domain/exceptions/insumo-nao-encontrado.exception';
import { InsumoRepository } from '../../domain/repositories/insumo.repository';

export class BuscarInsumoPorIdUseCase {
  constructor(private readonly repo: InsumoRepository) {}

  async executar(insumoId: number): Promise<Insumo> {
    const insumo = await this.repo.buscarPorId(insumoId);
    if (!insumo) throw new InsumoNaoEncontradoException(insumoId);
    return insumo;
  }
}
