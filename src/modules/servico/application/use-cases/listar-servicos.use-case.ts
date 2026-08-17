import { Servico } from '../../domain/entities/servico.entity';
import { ServicoRepository } from '../../domain/repositories/servico.repository';

export class ListarServicosUseCase {
  constructor(private readonly repo: ServicoRepository) {}

  executar(): Promise<Servico[]> {
    return this.repo.listar();
  }
}
