import { ServicoInvalidoException } from '../exceptions/servico-invalido.exception';

type CriarProps = {
  descricao: string;
  valor: number;
};

type ReconstituirProps = {
  servicoId: number;
  descricao: string;
  valor: number;
  criadoEm: Date;
  atualizadoEm: Date;
  deletadoEm: Date | null;
};

type Alteracoes = {
  descricao?: string;
  valor?: number;
};

export class Servico {
  private _descricao: string;
  private _valor: number;
  private _atualizadoEm: Date;
  private _deletadoEm: Date | null;
  private readonly _foiCriadoAgora: boolean;

  private constructor(
    readonly servicoId: number | null,
    readonly criadoEm: Date,
    descricao: string,
    valor: number,
    atualizadoEm: Date,
    deletadoEm: Date | null,
    foiCriadoAgora: boolean,
  ) {
    Servico.validarDescricao(descricao);
    Servico.validarValor(valor);
    this._descricao = descricao;
    this._valor = valor;
    this._atualizadoEm = atualizadoEm;
    this._deletadoEm = deletadoEm;
    this._foiCriadoAgora = foiCriadoAgora;
  }

  static criar(props: CriarProps): Servico {
    const agora = new Date();
    return new Servico(
      null,
      agora,
      props.descricao,
      props.valor,
      agora,
      null,
      true,
    );
  }

  static reconstituir(props: ReconstituirProps): Servico {
    return new Servico(
      props.servicoId,
      props.criadoEm,
      props.descricao,
      props.valor,
      props.atualizadoEm,
      props.deletadoEm,
      false,
    );
  }

  get descricao(): string {
    return this._descricao;
  }

  get valor(): number {
    return this._valor;
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
    if (alteracoes.descricao !== undefined) {
      Servico.validarDescricao(alteracoes.descricao);
      this._descricao = alteracoes.descricao;
    }
    if (alteracoes.valor !== undefined) {
      Servico.validarValor(alteracoes.valor);
      this._valor = alteracoes.valor;
    }
    this._atualizadoEm = new Date();
  }

  softDelete(agora: Date = new Date()): void {
    this._deletadoEm = agora;
    this._atualizadoEm = agora;
  }

  private static validarDescricao(descricao: string): void {
    if (!descricao || descricao.trim().length < 2) {
      throw new ServicoInvalidoException(
        'A descrição do serviço deve conter no mínimo 2 caracteres.',
      );
    }
  }

  private static validarValor(valor: number): void {
    if (valor < 0) {
      throw new ServicoInvalidoException(
        'O valor do serviço não pode ser negativo.',
      );
    }
  }
}
