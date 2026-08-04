import { DocumentoCliente } from '../value-objects/documento-cliente.vo';
import { TipoCliente } from '../value-objects/tipo-cliente.vo';
import { VeiculoVinculado } from './veiculo-vinculado.entity';

type CriarProps = {
  clienteId: string;
  nome: string;
  telefone: string;
  numDocumento: string;
  tipo: TipoCliente;
};

type ReconstituirProps = {
  clienteId: string;
  nome: string;
  telefone: string;
  documento: DocumentoCliente;
  tipo: TipoCliente;
  criadoEm: Date;
  atualizadoEm: Date;
  deletadoEm: Date | null;
  veiculos: VeiculoVinculado[];
};

type Alteracoes = {
  nome?: string;
  telefone?: string;
  numDocumento?: string;
  tipo?: TipoCliente;
};

export class Cliente {
  private _nome: string;
  private _telefone: string;
  private _documento: DocumentoCliente;
  private _tipo: TipoCliente;
  private _atualizadoEm: Date;
  private _deletadoEm: Date | null;
  private readonly _veiculos: VeiculoVinculado[];
  private readonly _foiCriadoAgora: boolean;

  private constructor(
    readonly clienteId: string,
    readonly criadoEm: Date,
    nome: string,
    telefone: string,
    documento: DocumentoCliente,
    tipo: TipoCliente,
    atualizadoEm: Date,
    deletadoEm: Date | null,
    veiculos: VeiculoVinculado[],
    foiCriadoAgora: boolean,
  ) {
    this._nome = nome;
    this._telefone = telefone;
    this._documento = documento;
    this._tipo = tipo;
    this._atualizadoEm = atualizadoEm;
    this._deletadoEm = deletadoEm;
    this._veiculos = veiculos;
    this._foiCriadoAgora = foiCriadoAgora;
  }

  static criar(props: CriarProps): Cliente {
    const agora = new Date();
    const documento = DocumentoCliente.criar(props.numDocumento, props.tipo);
    return new Cliente(
      props.clienteId,
      agora,
      props.nome,
      props.telefone,
      documento,
      props.tipo,
      agora,
      null,
      [],
      true,
    );
  }

  static reconstituir(props: ReconstituirProps): Cliente {
    return new Cliente(
      props.clienteId,
      props.criadoEm,
      props.nome,
      props.telefone,
      props.documento,
      props.tipo,
      props.atualizadoEm,
      props.deletadoEm,
      props.veiculos,
      false,
    );
  }

  get nome(): string {
    return this._nome;
  }

  get telefone(): string {
    return this._telefone;
  }

  get documento(): DocumentoCliente {
    return this._documento;
  }

  get tipo(): TipoCliente {
    return this._tipo;
  }

  get atualizadoEm(): Date {
    return this._atualizadoEm;
  }

  get deletadoEm(): Date | null {
    return this._deletadoEm;
  }

  get veiculos(): readonly VeiculoVinculado[] {
    return this._veiculos;
  }

  get foiCriadoAgora(): boolean {
    return this._foiCriadoAgora;
  }

  alterar(alteracoes: Alteracoes): void {
    if (alteracoes.nome !== undefined) this._nome = alteracoes.nome;
    if (alteracoes.telefone !== undefined) this._telefone = alteracoes.telefone;

    const tipoAlvo = alteracoes.tipo ?? this._tipo;
    if (alteracoes.numDocumento !== undefined || alteracoes.tipo !== undefined) {
      const numeroAlvo = alteracoes.numDocumento ?? this._documento.numero;
      this._documento = DocumentoCliente.criar(numeroAlvo, tipoAlvo);
      this._tipo = tipoAlvo;
    }

    this._atualizadoEm = new Date();
  }

  softDelete(agora: Date = new Date()): void {
    this._deletadoEm = agora;
    this._atualizadoEm = agora;
  }
}
