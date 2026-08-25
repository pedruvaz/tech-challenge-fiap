import { registerDecorator, ValidationOptions } from 'class-validator';
import { isValidPlaca } from '../../shared/domain/placa';

export { isValidPlaca };

export function IsPlacaVeiculo(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isPlacaVeiculo',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') return false;
          return isValidPlaca(value);
        },
        defaultMessage(): string {
          return 'Placa inválida. Use o formato antigo (AAA-1234 / AAA1234) ou Mercosul (AAA1A23)';
        },
      },
    });
  };
}
