import { Dinheiro } from '../value-objects/dinheiro.vo';
import { EstoqueInsuficienteException } from '../exceptions/estoque-insuficiente.exception';

export class Peca {
  private constructor(
    readonly pecaId: number,
    readonly nome: string,
    private _qtdEstoque: number,
    readonly valorUn: Dinheiro,
  ) {}

  static reconstituir(props: {
    pecaId: number;
    nome: string;
    qtdEstoque: number;
    valorUn: Dinheiro;
  }): Peca {
    return new Peca(props.pecaId, props.nome, props.qtdEstoque, props.valorUn);
  }

  get qtdEstoque(): number {
    return this._qtdEstoque;
  }

  ajustarEstoque(delta: number): void {
    if (delta > 0 && this._qtdEstoque < delta) {
      throw new EstoqueInsuficienteException(
        'peça',
        this.nome,
        this._qtdEstoque,
        delta,
      );
    }
    this._qtdEstoque -= delta;
  }
}
