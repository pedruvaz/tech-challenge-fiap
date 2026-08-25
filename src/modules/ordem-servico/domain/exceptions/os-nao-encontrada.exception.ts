import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class OsNaoEncontradaException extends DomainException {
  readonly kind = 'NOT_FOUND' as const;

  constructor(osId: string) {
    super(`Ordem de serviço '${osId}' não encontrada`);
  }
}
