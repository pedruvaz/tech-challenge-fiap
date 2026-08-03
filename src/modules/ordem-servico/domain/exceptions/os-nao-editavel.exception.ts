import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { StatusOSValor } from '../value-objects/status-os.vo';

export class OsNaoEditavelException extends DomainException {
  readonly kind = 'INVALID_INPUT' as const;

  constructor(status: StatusOSValor) {
    super(`Não é possível alterar os itens de uma OS com status '${status}'`);
  }
}
