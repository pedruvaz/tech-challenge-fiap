import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class VeiculoNaoEncontradoException extends DomainException {
  readonly kind = 'NOT_FOUND' as const;

  constructor(veiculoId: string) {
    super(`Veículo com id ${veiculoId} não encontrado`);
  }
}
