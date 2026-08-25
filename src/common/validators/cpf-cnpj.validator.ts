import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { Tipo } from '@prisma/client';
import { isValidCnpj, isValidCpf } from '../../shared/domain/documento';

export { isValidCpf, isValidCnpj };

/**
 * Valida o `numDocumento` de acordo com o `tipo` do objeto:
 * - `pessoa_fisica`   → CPF válido
 * - `pessoa_juridica` → CNPJ válido
 *
 * Se o `tipo` não estiver presente (ex.: update parcial sem alterar o tipo),
 * aceita qualquer documento que seja um CPF **ou** CNPJ válido.
 */
export function IsCpfCnpj(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isCpfCnpj',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          if (typeof value !== 'string') return false;
          const tipo = (args.object as { tipo?: Tipo }).tipo;
          if (tipo === Tipo.pessoa_fisica) return isValidCpf(value);
          if (tipo === Tipo.pessoa_juridica) return isValidCnpj(value);
          return isValidCpf(value) || isValidCnpj(value);
        },
        defaultMessage(args: ValidationArguments): string {
          const tipo = (args.object as { tipo?: Tipo }).tipo;
          if (tipo === Tipo.pessoa_fisica) return 'CPF inválido';
          if (tipo === Tipo.pessoa_juridica) return 'CNPJ inválido';
          return 'CPF ou CNPJ inválido';
        },
      },
    });
  };
}
