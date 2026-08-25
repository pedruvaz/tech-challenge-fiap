import { Peca } from '../../domain/entities/peca.entity';
import { PecaRepository } from '../../domain/repositories/peca.repository';

export type CriarPecaInput = {
  nome: string;
  qtdEstoque: number;
  valorUn: number;
};

export class CriarPecaUseCase {
  constructor(private readonly repo: PecaRepository) {}

  async executar(input: CriarPecaInput): Promise<Peca> {
    const peca = Peca.criar(input);
    return this.repo.salvar(peca);
  }
}
