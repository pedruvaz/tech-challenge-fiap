export type TipoClienteValor = 'pessoa_fisica' | 'pessoa_juridica';

export class TipoCliente {
  private constructor(private readonly _valor: TipoClienteValor) {}

  static pessoaFisica(): TipoCliente {
    return new TipoCliente('pessoa_fisica');
  }

  static pessoaJuridica(): TipoCliente {
    return new TipoCliente('pessoa_juridica');
  }

  static de(valor: TipoClienteValor): TipoCliente {
    return new TipoCliente(valor);
  }

  get valor(): TipoClienteValor {
    return this._valor;
  }

  ehPessoaFisica(): boolean {
    return this._valor === 'pessoa_fisica';
  }

  ehPessoaJuridica(): boolean {
    return this._valor === 'pessoa_juridica';
  }
}
