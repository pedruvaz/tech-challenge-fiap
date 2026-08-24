import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class VeiculoNaoPertenceAoClienteException extends DomainException {
  readonly kind = 'INVALID_INPUT' as const;

  constructor(veiculoId: string, clienteId: string) {
    super(`O veículo '${veiculoId}' não pertence ao cliente '${clienteId}'`);
  }
}
