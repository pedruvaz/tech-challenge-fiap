import { Dinheiro } from '../value-objects/dinheiro.vo';
import { EstoqueInsuficienteException } from '../exceptions/estoque-insuficiente.exception';

export class Insumo {
  private constructor(
    readonly insumoId: number,
    readonly nome: string,
    private _qtdEstoque: number,
    readonly valorUn: Dinheiro,
  ) {}

  static reconstituir(props: {
    insumoId: number;
    nome: string;
    qtdEstoque: number;
    valorUn: Dinheiro;
  }): Insumo {
    return new Insumo(
      props.insumoId,
      props.nome,
      props.qtdEstoque,
      props.valorUn,
    );
  }

  get qtdEstoque(): number {
    return this._qtdEstoque;
  }

  ajustarEstoque(delta: number): void {
    if (delta > 0 && this._qtdEstoque < delta) {
      throw new EstoqueInsuficienteException(
        'insumo',
        this.nome,
        this._qtdEstoque,
        delta,
      );
    }
    this._qtdEstoque -= delta;
  }
}
