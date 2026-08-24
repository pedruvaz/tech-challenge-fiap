import { Dinheiro } from '../value-objects/dinheiro.vo';

export class InsumoConsumido {
  constructor(
    readonly insumoId: number,
    readonly qtdConsumida: number,
    readonly valorUnitario: Dinheiro,
  ) {
    if (!Number.isInteger(qtdConsumida) || qtdConsumida < 1) {
      throw new Error(`Quantidade de insumo inválida: ${qtdConsumida}`);
    }
  }

  totalLinha(): Dinheiro {
    return this.valorUnitario.multiplicar(this.qtdConsumida);
  }
}
