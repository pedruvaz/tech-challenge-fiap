import { ServicoNaoEncontradoException } from '../../domain/exceptions/servico-nao-encontrado.exception';
import { ServicoRepository } from '../../domain/repositories/servico.repository';

export class RemoverServicoUseCase {
  constructor(private readonly repo: ServicoRepository) {}

  async executar(servicoId: number): Promise<void> {
    const servico = await this.repo.buscarPorId(servicoId);
    if (!servico) throw new ServicoNaoEncontradoException(servicoId);

    servico.softDelete();
    await this.repo.salvar(servico);
  }
}
