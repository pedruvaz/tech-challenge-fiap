import { Insumo } from '../../domain/entities/insumo.entity';
import { InsumoRepository } from '../../domain/repositories/insumo.repository';

export type CriarInsumoInput = {
  nome: string;
  qtdEstoque: number;
  valorUn: number;
};

export class CriarInsumoUseCase {
  constructor(private readonly repo: InsumoRepository) {}

  async executar(input: CriarInsumoInput): Promise<Insumo> {
    const insumo = Insumo.criar(input);
    return this.repo.salvar(insumo);
  }
}
