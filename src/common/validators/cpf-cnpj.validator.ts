import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { Tipo } from '@prisma/client';

/** Remove tudo que não for dígito. */
const apenasDigitos = (valor: string): string => valor.replace(/\D/g, '');

/**
 * Calcula um dígito verificador (módulo 11) para CPF/CNPJ.
 * `pesos` deve ter o mesmo tamanho do trecho numérico considerado.
 */
const digitoVerificador = (numeros: number[], pesos: number[]): number => {
  const soma = numeros.reduce((acc, num, i) => acc + num * pesos[i], 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
};

export function isValidCpf(valor: string): boolean {
  const cpf = apenasDigitos(valor);

  if (cpf.length !== 11) return false;
  // Rejeita sequências repetidas (000.000.000-00, 111.111.111-11, ...).
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const digitos = cpf.split('').map(Number);
  const dv1 = digitoVerificador(digitos.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const dv2 = digitoVerificador(
    digitos.slice(0, 10),
    [11, 10, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return dv1 === digitos[9] && dv2 === digitos[10];
}

export function isValidCnpj(valor: string): boolean {
  const cnpj = apenasDigitos(valor);

  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const digitos = cnpj.split('').map(Number);
  const dv1 = digitoVerificador(
    digitos.slice(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  const dv2 = digitoVerificador(
    digitos.slice(0, 13),
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return dv1 === digitos[12] && dv2 === digitos[13];
}

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

          // tipo desconhecido: aceita CPF ou CNPJ válido.
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
