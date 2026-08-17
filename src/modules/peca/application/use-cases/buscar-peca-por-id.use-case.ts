import { Peca } from '../../domain/entities/peca.entity';
import { PecaNaoEncontradaException } from '../../domain/exceptions/peca-nao-encontrada.exception';
import { PecaRepository } from '../../domain/repositories/peca.repository';

export class BuscarPecaPorIdUseCase {
  constructor(private readonly repo: PecaRepository) {}

  async executar(pecaId: number): Promise<Peca> {
    const peca = await this.repo.buscarPorId(pecaId);
    if (!peca) throw new PecaNaoEncontradaException(pecaId);
    return peca;
  }
}
