import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import type { StatusOSValor } from '../value-objects/status-os.vo';

export class AprovacaoInvalidaException extends DomainException {
  readonly kind = 'INVALID_INPUT' as const;

  constructor(statusAtual: StatusOSValor) {
    super(
      `Só é possível aprovar o orçamento quando o status é 'aguardando_aprovacao'. Status atual: '${statusAtual}'`,
    );
  }
}
