import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { TipoClienteValor } from '../value-objects/tipo-cliente.vo';

export class DocumentoInvalidoException extends DomainException {
  readonly kind = 'INVALID_INPUT' as const;

  constructor(tipo: TipoClienteValor) {
    const mensagem =
      tipo === 'pessoa_fisica'
        ? 'CPF inválido'
        : tipo === 'pessoa_juridica'
          ? 'CNPJ inválido'
          : 'CPF ou CNPJ inválido';
    super(mensagem);
  }
}
