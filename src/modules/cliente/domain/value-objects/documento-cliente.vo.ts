import {
  apenasDigitos,
  isValidCnpj,
  isValidCpf,
} from '../../../../shared/domain/documento';
import { DocumentoInvalidoException } from '../exceptions/documento-invalido.exception';
import { TipoCliente } from './tipo-cliente.vo';

// Value object que carrega o número do documento (CPF/CNPJ) e garante que
// ele é consistente com o tipo do cliente na construção.
export class DocumentoCliente {
  private constructor(readonly numero: string) {}

  static criar(numero: string, tipo: TipoCliente): DocumentoCliente {
    const valido = tipo.ehPessoaFisica()
      ? isValidCpf(numero)
      : isValidCnpj(numero);
    if (!valido) {
      throw new DocumentoInvalidoException(tipo.valor);
    }
    return new DocumentoCliente(numero);
  }

  // Reconstitui sem revalidar — usado ao hidratar da persistência.
  static reconstituir(numero: string): DocumentoCliente {
    return new DocumentoCliente(numero);
  }

  confereCom(informado: string): boolean {
    return apenasDigitos(this.numero) === apenasDigitos(informado);
  }
}
