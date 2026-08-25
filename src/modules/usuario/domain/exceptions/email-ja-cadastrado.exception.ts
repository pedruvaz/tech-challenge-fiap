import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class EmailJaCadastradoException extends DomainException {
  readonly kind = 'CONFLICT' as const;

  constructor() {
    super('Já existe um usuário com este email');
  }
}
