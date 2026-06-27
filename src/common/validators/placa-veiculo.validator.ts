import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

// Placa antiga (até 2018): AAA-1234 ou AAA1234 (3 letras + 4 dígitos).
const PLACA_ANTIGA = /^[A-Z]{3}-?\d{4}$/;
// Placa Mercosul: AAA1A23 (3 letras + 1 dígito + 1 letra + 2 dígitos).
const PLACA_MERCOSUL = /^[A-Z]{3}\d[A-Z]\d{2}$/;

export function isValidPlaca(valor: string): boolean {
  const placa = valor.replace(/\s/g, '').toUpperCase();
  return PLACA_ANTIGA.test(placa) || PLACA_MERCOSUL.test(placa);
}

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
