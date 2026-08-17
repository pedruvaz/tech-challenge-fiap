import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class PecaInvalidaException extends DomainException {
  readonly kind = 'INVALID_INPUT' as const;

  constructor(mensagem: string) {
    super(mensagem);
  }
}
