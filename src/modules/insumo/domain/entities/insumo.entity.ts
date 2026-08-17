import { InsumoInvalidoException } from '../exceptions/insumo-invalido.exception';

type CriarProps = {
  nome: string;
  qtdEstoque: number;
  valorUn: number;
};

type ReconstituirProps = {
  insumoId: number;
  nome: string;
  qtdEstoque: number;
  valorUn: number;
  criadoEm: Date;
  atualizadoEm: Date;
  deletadoEm: Date | null;
};

type Alteracoes = {
  nome?: string;
  qtdEstoque?: number;
  valorUn?: number;
};

export class Insumo {
  private _nome: string;
  private _qtdEstoque: number;
  private _valorUn: number;
  private _atualizadoEm: Date;
  private _deletadoEm: Date | null;
  private readonly _foiCriadoAgora: boolean;

  private constructor(
    readonly insumoId: number | null,
    readonly criadoEm: Date,
    nome: string,
    qtdEstoque: number,
    valorUn: number,
    atualizadoEm: Date,
    deletadoEm: Date | null,
    foiCriadoAgora: boolean,
  ) {
    Insumo.validarNome(nome);
    Insumo.validarQuantidade(qtdEstoque);
    Insumo.validarValor(valorUn);
    this._nome = nome;
    this._qtdEstoque = qtdEstoque;
    this._valorUn = valorUn;
    this._atualizadoEm = atualizadoEm;
    this._deletadoEm = deletadoEm;
    this._foiCriadoAgora = foiCriadoAgora;
  }

  static criar(props: CriarProps): Insumo {
    const agora = new Date();
    return new Insumo(
      null,
      agora,
      props.nome,
      props.qtdEstoque,
      props.valorUn,
      agora,
      null,
      true,
    );
  }

  static reconstituir(props: ReconstituirProps): Insumo {
    return new Insumo(
      props.insumoId,
      props.criadoEm,
      props.nome,
      props.qtdEstoque,
      props.valorUn,
      props.atualizadoEm,
      props.deletadoEm,
      false,
    );
  }

  get nome(): string {
    return this._nome;
  }

  get qtdEstoque(): number {
    return this._qtdEstoque;
  }

  get valorUn(): number {
    return this._valorUn;
  }

  get atualizadoEm(): Date {
    return this._atualizadoEm;
  }

  get deletadoEm(): Date | null {
    return this._deletadoEm;
  }

  get foiCriadoAgora(): boolean {
    return this._foiCriadoAgora;
  }

  alterar(alteracoes: Alteracoes): void {
    if (alteracoes.nome !== undefined) {
      Insumo.validarNome(alteracoes.nome);
      this._nome = alteracoes.nome;
    }
    if (alteracoes.qtdEstoque !== undefined) {
      Insumo.validarQuantidade(alteracoes.qtdEstoque);
      this._qtdEstoque = alteracoes.qtdEstoque;
    }
    if (alteracoes.valorUn !== undefined) {
      Insumo.validarValor(alteracoes.valorUn);
      this._valorUn = alteracoes.valorUn;
    }
    this._atualizadoEm = new Date();
  }

  softDelete(agora: Date = new Date()): void {
    this._deletadoEm = agora;
    this._atualizadoEm = agora;
  }

  private static validarNome(nome: string): void {
    if (!nome || nome.trim().length < 2) {
      throw new InsumoInvalidoException(
        'O nome do insumo deve conter no mínimo 2 caracteres.',
      );
    }
  }

  private static validarQuantidade(quantidade: number): void {
    if (quantidade < 0) {
      throw new InsumoInvalidoException(
        'A quantidade em estoque não pode ser negativa.',
      );
    }
  }

  private static validarValor(valor: number): void {
    if (valor < 0) {
      throw new InsumoInvalidoException(
        'O valor unitário não pode ser negativo.',
      );
    }
  }
}
