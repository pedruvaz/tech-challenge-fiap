import { Insumo } from '../../domain/entities/insumo.entity';
import { InsumoRepository } from '../../domain/repositories/insumo.repository';

export class ListarInsumosUseCase {
  constructor(private readonly repo: InsumoRepository) {}

  executar(): Promise<Insumo[]> {
    return this.repo.listar();
  }
}
