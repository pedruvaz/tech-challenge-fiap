const CENTAVOS_POR_UNIDADE = 100;

export class Dinheiro {
  private constructor(private readonly _centavos: number) {}

  static zero(): Dinheiro {
    return new Dinheiro(0);
  }

  static deNumero(valor: number): Dinheiro {
    if (!Number.isFinite(valor)) {
      throw new Error(`Valor monetário inválido: ${valor}`);
    }
    return new Dinheiro(Math.round(valor * CENTAVOS_POR_UNIDADE));
  }

  static deString(valor: string): Dinheiro {
    return Dinheiro.deNumero(Number(valor));
  }

  somar(outro: Dinheiro): Dinheiro {
    return new Dinheiro(this._centavos + outro._centavos);
  }

  multiplicar(quantidade: number): Dinheiro {
    if (!Number.isInteger(quantidade) || quantidade < 0) {
      throw new Error(`Quantidade inválida para multiplicação: ${quantidade}`);
    }
    return new Dinheiro(this._centavos * quantidade);
  }

  paraNumero(): number {
    return this._centavos / CENTAVOS_POR_UNIDADE;
  }

  paraString(): string {
    return this.paraNumero().toFixed(2);
  }

  igual(outro: Dinheiro): boolean {
    return this._centavos === outro._centavos;
  }
}
