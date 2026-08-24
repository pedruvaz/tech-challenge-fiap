import { Dinheiro } from '../value-objects/dinheiro.vo';

export class ServicoRealizado {
  constructor(
    readonly servicoId: number,
    readonly quantidade: number,
    readonly valorUnitario: Dinheiro,
  ) {
    if (!Number.isInteger(quantidade) || quantidade < 1) {
      throw new Error(`Quantidade de serviço inválida: ${quantidade}`);
    }
  }

  totalLinha(): Dinheiro {
    return this.valorUnitario.multiplicar(this.quantidade);
  }
}
