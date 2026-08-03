import { Dinheiro } from '../value-objects/dinheiro.vo';

export class PecaUtilizada {
  constructor(
    readonly pecaId: number,
    readonly qtd: number,
    readonly valorUnitario: Dinheiro,
  ) {
    if (!Number.isInteger(qtd) || qtd < 1) {
      throw new Error(`Quantidade de peça inválida: ${qtd}`);
    }
  }

  totalLinha(): Dinheiro {
    return this.valorUnitario.multiplicar(this.qtd);
  }
}
