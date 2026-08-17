import { isValidPlaca } from '../../../../shared/domain/placa';
import { PlacaInvalidaException } from '../exceptions/placa-invalida.exception';

export class Placa {
  private constructor(readonly valor: string) {}

  static criar(valor: string): Placa {
    if (!isValidPlaca(valor)) {
      throw new PlacaInvalidaException();
    }
    return new Placa(valor);
  }

  static reconstituir(valor: string): Placa {
    return new Placa(valor);
  }
}
