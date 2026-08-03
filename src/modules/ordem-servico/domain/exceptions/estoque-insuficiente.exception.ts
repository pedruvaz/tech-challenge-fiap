import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class EstoqueInsuficienteException extends DomainException {
  readonly kind = 'INVALID_INPUT' as const;

  constructor(tipo: 'peça' | 'insumo', nome: string, disponivel: number, necessario: number) {
    super(
      `Estoque insuficiente para ${tipo === 'peça' ? 'a peça' : 'o insumo'} '${nome}'. Disponível: ${disponivel}, necessário: ${necessario}`,
    );
  }
}
