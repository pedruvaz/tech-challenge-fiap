import { Placa } from '../value-objects/placa.vo';

type CriarProps = {
  veiculoId: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
  clienteProprietarioId: string;
};

type ReconstituirProps = {
  veiculoId: string;
  placa: Placa;
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
  criadoEm: Date;
  atualizadoEm: Date;
  deletadoEm: Date | null;
};

type Alteracoes = {
  placa?: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  cor?: string;
};

export class Veiculo {
  private _placa: Placa;
  private _marca: string;
  private _modelo: string;
  private _ano: string;
  private _cor: string;
  private _atualizadoEm: Date;
  private _deletadoEm: Date | null;
  private readonly _foiCriadoAgora: boolean;
  // Identificador do cliente proprietário — só relevante na criação, para que
  // o repositório persista o vínculo veiculo_cliente na mesma transação.
  private readonly _clienteProprietarioId: string | null;

  private constructor(
    readonly veiculoId: string,
    readonly criadoEm: Date,
    placa: Placa,
    marca: string,
    modelo: string,
    ano: string,
    cor: string,
    atualizadoEm: Date,
    deletadoEm: Date | null,
    foiCriadoAgora: boolean,
    clienteProprietarioId: string | null,
  ) {
    this._placa = placa;
    this._marca = marca;
    this._modelo = modelo;
    this._ano = ano;
    this._cor = cor;
    this._atualizadoEm = atualizadoEm;
    this._deletadoEm = deletadoEm;
    this._foiCriadoAgora = foiCriadoAgora;
    this._clienteProprietarioId = clienteProprietarioId;
  }

  static criar(props: CriarProps): Veiculo {
    const agora = new Date();
    return new Veiculo(
      props.veiculoId,
      agora,
      Placa.criar(props.placa),
      props.marca,
      props.modelo,
      props.ano,
      props.cor,
      agora,
      null,
      true,
      props.clienteProprietarioId,
    );
  }

  static reconstituir(props: ReconstituirProps): Veiculo {
    return new Veiculo(
      props.veiculoId,
      props.criadoEm,
      props.placa,
      props.marca,
      props.modelo,
      props.ano,
      props.cor,
      props.atualizadoEm,
      props.deletadoEm,
      false,
      null,
    );
  }

  get placa(): Placa {
    return this._placa;
  }

  get marca(): string {
    return this._marca;
  }

  get modelo(): string {
    return this._modelo;
  }

  get ano(): string {
    return this._ano;
  }

  get cor(): string {
    return this._cor;
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

  get clienteProprietarioId(): string | null {
    return this._clienteProprietarioId;
  }

  alterar(alteracoes: Alteracoes): void {
    if (alteracoes.placa !== undefined)
      this._placa = Placa.criar(alteracoes.placa);
    if (alteracoes.marca !== undefined) this._marca = alteracoes.marca;
    if (alteracoes.modelo !== undefined) this._modelo = alteracoes.modelo;
    if (alteracoes.ano !== undefined) this._ano = alteracoes.ano;
    if (alteracoes.cor !== undefined) this._cor = alteracoes.cor;
    this._atualizadoEm = new Date();
  }

  softDelete(agora: Date = new Date()): void {
    this._deletadoEm = agora;
    this._atualizadoEm = agora;
  }
}
