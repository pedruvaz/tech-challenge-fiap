import { OrdemServico } from '../../domain/entities/ordem-servico.entity';
import {
  FiltrosOrdemServico,
  OrdemServicoRepository,
} from '../../domain/repositories/ordem-servico.repository';

export class ListarOrdensServicoUseCase {
  constructor(private readonly osRepo: OrdemServicoRepository) {}

  executar(filtros?: FiltrosOrdemServico): Promise<OrdemServico[]> {
    return this.osRepo.listar(filtros);
  }
}
