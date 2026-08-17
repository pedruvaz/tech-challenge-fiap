import { PecaInvalidaException } from '../exceptions/peca-invalida.exception';

type CriarProps = {
  nome: string;
  qtdEstoque: number;
  valorUn: number;
};

type ReconstituirProps = {
  pecaId: number;
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

export class Peca {
  private _nome: string;
  private _qtdEstoque: number;
  private _valorUn: number;
  private _atualizadoEm: Date;
  private _deletadoEm: Date | null;
  private readonly _foiCriadoAgora: boolean;

  private constructor(
    readonly pecaId: number | null,
    readonly criadoEm: Date,
    nome: string,
    qtdEstoque: number,
    valorUn: number,
    atualizadoEm: Date,
    deletadoEm: Date | null,
    foiCriadoAgora: boolean,
  ) {
    Peca.validarNome(nome);
    Peca.validarQuantidade(qtdEstoque);
    Peca.validarValor(valorUn);
    this._nome = nome;
    this._qtdEstoque = qtdEstoque;
    this._valorUn = valorUn;
    this._atualizadoEm = atualizadoEm;
    this._deletadoEm = deletadoEm;
    this._foiCriadoAgora = foiCriadoAgora;
  }

  static criar(props: CriarProps): Peca {
    const agora = new Date();
    return new Peca(
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

  static reconstituir(props: ReconstituirProps): Peca {
    return new Peca(
      props.pecaId,
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
      Peca.validarNome(alteracoes.nome);
      this._nome = alteracoes.nome;
    }
    if (alteracoes.qtdEstoque !== undefined) {
      Peca.validarQuantidade(alteracoes.qtdEstoque);
      this._qtdEstoque = alteracoes.qtdEstoque;
    }
    if (alteracoes.valorUn !== undefined) {
      Peca.validarValor(alteracoes.valorUn);
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
      throw new PecaInvalidaException(
        'O nome da peça deve conter no mínimo 2 caracteres.',
      );
    }
  }

  private static validarQuantidade(quantidade: number): void {
    if (quantidade < 0) {
      throw new PecaInvalidaException(
        'A quantidade em estoque não pode ser negativa.',
      );
    }
  }

  private static validarValor(valor: number): void {
    if (valor < 0) {
      throw new PecaInvalidaException(
        'O valor unitário não pode ser negativo.',
      );
    }
  }
}
