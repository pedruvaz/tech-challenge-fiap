import { PecaNaoEncontradaException } from '../../domain/exceptions/peca-nao-encontrada.exception';
import { PecaRepository } from '../../domain/repositories/peca.repository';

export class RemoverPecaUseCase {
  constructor(private readonly repo: PecaRepository) {}

  async executar(pecaId: number): Promise<void> {
    const peca = await this.repo.buscarPorId(pecaId);
    if (!peca) throw new PecaNaoEncontradaException(pecaId);

    peca.softDelete();
    await this.repo.salvar(peca);
  }
}
