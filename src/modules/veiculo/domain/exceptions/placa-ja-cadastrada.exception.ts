import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class PlacaJaCadastradaException extends DomainException {
  readonly kind = 'CONFLICT' as const;

  constructor() {
    super('Já existe um veículo com esta placa');
  }
}
