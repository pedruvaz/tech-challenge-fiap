import { Servico } from '../../domain/entities/servico.entity';
import { ServicoNaoEncontradoException } from '../../domain/exceptions/servico-nao-encontrado.exception';
import { ServicoRepository } from '../../domain/repositories/servico.repository';

export class BuscarServicoPorIdUseCase {
  constructor(private readonly repo: ServicoRepository) {}

  async executar(servicoId: number): Promise<Servico> {
    const servico = await this.repo.buscarPorId(servicoId);
    if (!servico) throw new ServicoNaoEncontradoException(servicoId);
    return servico;
  }
}
