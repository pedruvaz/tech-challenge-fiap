import { Peca } from '../../domain/entities/peca.entity';
import { PecaNaoEncontradaException } from '../../domain/exceptions/peca-nao-encontrada.exception';
import { PecaRepository } from '../../domain/repositories/peca.repository';

export type AtualizarPecaInput = {
  pecaId: number;
  nome?: string;
  qtdEstoque?: number;
  valorUn?: number;
};

export class AtualizarPecaUseCase {
  constructor(private readonly repo: PecaRepository) {}

  async executar(input: AtualizarPecaInput): Promise<Peca> {
    const peca = await this.repo.buscarPorId(input.pecaId);
    if (!peca) throw new PecaNaoEncontradaException(input.pecaId);

    peca.alterar({
      nome: input.nome,
      qtdEstoque: input.qtdEstoque,
      valorUn: input.valorUn,
    });
    return this.repo.salvar(peca);
  }
}
