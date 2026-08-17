import { Insumo } from '../../domain/entities/insumo.entity';
import { InsumoNaoEncontradoException } from '../../domain/exceptions/insumo-nao-encontrado.exception';
import { InsumoRepository } from '../../domain/repositories/insumo.repository';

export type AtualizarInsumoInput = {
  insumoId: number;
  nome?: string;
  qtdEstoque?: number;
  valorUn?: number;
};

export class AtualizarInsumoUseCase {
  constructor(private readonly repo: InsumoRepository) {}

  async executar(input: AtualizarInsumoInput): Promise<Insumo> {
    const insumo = await this.repo.buscarPorId(input.insumoId);
    if (!insumo) throw new InsumoNaoEncontradoException(input.insumoId);

    insumo.alterar({
      nome: input.nome,
      qtdEstoque: input.qtdEstoque,
      valorUn: input.valorUn,
    });
    return this.repo.salvar(insumo);
  }
}
