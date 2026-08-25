import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class DocumentoJaCadastradoException extends DomainException {
  readonly kind = 'CONFLICT' as const;

  constructor() {
    super('Já existe um cliente com este número de documento');
  }
}
