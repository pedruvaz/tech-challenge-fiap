import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class PecaNaoEncontradaException extends DomainException {
  readonly kind = 'NOT_FOUND' as const;

  constructor(pecaId: number) {
    super(`Peça com id ${pecaId} não encontrada`);
  }
}
