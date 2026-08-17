import { Roles } from '@prisma/client';

type CriarProps = {
  nome: string;
  email: string;
  senhaHash: string;
  roles: Roles;
};

type ReconstituirProps = {
  idUsuario: number;
  nome: string;
  email: string;
  senhaHash: string;
  roles: Roles;
  criadoEm: Date;
  atualizadoEm: Date;
  deletadoEm: Date | null;
};

type Alteracoes = {
  nome?: string;
  email?: string;
  senhaHash?: string;
  roles?: Roles;
};

export class Usuario {
  private _nome: string;
  private _email: string;
  private _senhaHash: string;
  private _roles: Roles;
  private _atualizadoEm: Date;
  private _deletadoEm: Date | null;
  private readonly _foiCriadoAgora: boolean;

  private constructor(
    readonly idUsuario: number | null,
    readonly criadoEm: Date,
    nome: string,
    email: string,
    senhaHash: string,
    roles: Roles,
    atualizadoEm: Date,
    deletadoEm: Date | null,
    foiCriadoAgora: boolean,
  ) {
    this._nome = nome;
    this._email = email;
    this._senhaHash = senhaHash;
    this._roles = roles;
    this._atualizadoEm = atualizadoEm;
    this._deletadoEm = deletadoEm;
    this._foiCriadoAgora = foiCriadoAgora;
  }

  static criar(props: CriarProps): Usuario {
    const agora = new Date();
    return new Usuario(
      null,
      agora,
      props.nome,
      props.email,
      props.senhaHash,
      props.roles,
      agora,
      null,
      true,
    );
  }

  static reconstituir(props: ReconstituirProps): Usuario {
    return new Usuario(
      props.idUsuario,
      props.criadoEm,
      props.nome,
      props.email,
      props.senhaHash,
      props.roles,
      props.atualizadoEm,
      props.deletadoEm,
      false,
    );
  }

  get nome(): string {
    return this._nome;
  }

  get email(): string {
    return this._email;
  }

  get senhaHash(): string {
    return this._senhaHash;
  }

  get roles(): Roles {
    return this._roles;
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
    if (alteracoes.nome !== undefined) this._nome = alteracoes.nome;
    if (alteracoes.email !== undefined) this._email = alteracoes.email;
    if (alteracoes.senhaHash !== undefined)
      this._senhaHash = alteracoes.senhaHash;
    if (alteracoes.roles !== undefined) this._roles = alteracoes.roles;
    this._atualizadoEm = new Date();
  }

  softDelete(agora: Date = new Date()): void {
    this._deletadoEm = agora;
    this._atualizadoEm = agora;
  }
}
