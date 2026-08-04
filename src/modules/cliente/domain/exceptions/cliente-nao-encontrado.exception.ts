import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class ClienteNaoEncontradoException extends DomainException {
  readonly kind = 'NOT_FOUND' as const;

  constructor(clienteId: string) {
    super(`Cliente com id ${clienteId} não encontrado`);
  }
}
