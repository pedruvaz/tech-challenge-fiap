export class Cliente {
  constructor(
    readonly clienteId: string,
    readonly nome: string,
    readonly numDocumento: string,
  ) {}

  documentoConfereCom(informado: string): boolean {
    const normalizar = (v: string): string => v.replace(/\D/g, '');
    return normalizar(this.numDocumento) === normalizar(informado);
  }
}
