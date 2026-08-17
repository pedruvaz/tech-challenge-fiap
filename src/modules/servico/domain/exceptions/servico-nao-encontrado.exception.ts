import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class ServicoNaoEncontradoException extends DomainException {
  readonly kind = 'NOT_FOUND' as const;

  constructor(servicoId: number) {
    super(`Serviço com id ${servicoId} não encontrado`);
  }
}
