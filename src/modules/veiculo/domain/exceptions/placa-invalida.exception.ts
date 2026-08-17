import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class PlacaInvalidaException extends DomainException {
  readonly kind = 'INVALID_INPUT' as const;

  constructor() {
    super(
      'Placa inválida. Use o formato antigo (AAA-1234 / AAA1234) ou Mercosul (AAA1A23)',
    );
  }
}
