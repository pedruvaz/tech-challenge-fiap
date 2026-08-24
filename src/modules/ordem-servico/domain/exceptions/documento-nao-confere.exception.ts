import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class DocumentoNaoConfereException extends DomainException {
  readonly kind = 'FORBIDDEN' as const;

  constructor() {
    super(
      'O documento informado não confere com o dono desta ordem de serviço',
    );
  }
}
