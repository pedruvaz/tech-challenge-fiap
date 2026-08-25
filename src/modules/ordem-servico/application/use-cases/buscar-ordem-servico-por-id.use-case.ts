import { OrdemServico } from '../../domain/entities/ordem-servico.entity';
import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import { OrdemServicoRepository } from '../../domain/repositories/ordem-servico.repository';

export class BuscarOrdemServicoPorIdUseCase {
  constructor(private readonly osRepo: OrdemServicoRepository) {}

  async executar(osId: string): Promise<OrdemServico> {
    const os = await this.osRepo.buscarPorId(osId);
    if (!os) throw new OsNaoEncontradaException(osId);
    return os;
  }
}
