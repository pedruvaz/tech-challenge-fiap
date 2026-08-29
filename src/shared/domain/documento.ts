// Funções puras de validação de CPF/CNPJ (módulo 11), sem dependência
// de framework. Usadas tanto pelo VO do domínio quanto pelo validator
// de class-validator na camada HTTP.

export const apenasDigitos = (valor: string): string =>
  valor.replace(/\D/g, '');

const digitoVerificador = (numeros: number[], pesos: number[]): number => {
  const soma = numeros.reduce((acc, num, i) => acc + num * pesos[i], 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
};

export function isValidCpf(valor: string): boolean {
  const cpf = apenasDigitos(valor);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const digitos = cpf.split('').map(Number);
  const dv1 = digitoVerificador(
    digitos.slice(0, 9),
    [10, 9, 8, 7, 6, 5, 4, 3, 2],
  );
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
