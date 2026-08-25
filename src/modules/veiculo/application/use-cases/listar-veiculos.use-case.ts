import { Veiculo } from '../../domain/entities/veiculo.entity';
import { VeiculoRepository } from '../../domain/repositories/veiculo.repository';

export class ListarVeiculosUseCase {
  constructor(private readonly repo: VeiculoRepository) {}

  executar(): Promise<Veiculo[]> {
    return this.repo.listar();
  }
}
