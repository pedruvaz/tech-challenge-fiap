import { Dinheiro } from '../value-objects/dinheiro.vo';

export class Servico {
  constructor(
    readonly servicoId: number,
    readonly descricao: string,
    readonly valor: Dinheiro,
  ) {}
}
