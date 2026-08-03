import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { StatusOSValor } from '../value-objects/status-os.vo';

export class TransicaoInvalidaException extends DomainException {
  readonly kind = 'INVALID_INPUT' as const;

  constructor(atual: StatusOSValor, proximoValido: StatusOSValor | null) {
    const mensagem =
      proximoValido === null
        ? `Status atual é '${atual}'. Não há transição possível a partir deste status`
        : `Status atual é '${atual}'. Só é possível avançar para '${proximoValido}'`;
    super(mensagem);
  }
}
