import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class InsumoNaoEncontradoException extends DomainException {
  readonly kind = 'NOT_FOUND' as const;

  constructor(insumoId: number) {
    super(`Insumo com id ${insumoId} não encontrado`);
  }
}
