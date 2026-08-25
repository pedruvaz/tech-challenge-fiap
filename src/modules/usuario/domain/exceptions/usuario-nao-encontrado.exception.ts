import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class UsuarioNaoEncontradoException extends DomainException {
  readonly kind = 'NOT_FOUND' as const;

  constructor(idUsuario: number) {
    super(`Usuário com id ${idUsuario} não encontrado`);
  }
}
