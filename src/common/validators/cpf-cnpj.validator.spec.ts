import { validateSync } from 'class-validator';
import { Tipo } from '@prisma/client';
import { IsCpfCnpj, isValidCnpj, isValidCpf } from './cpf-cnpj.validator';

describe('isValidCpf', () => {
  it('aceita CPF válido sem máscara', () => {
    expect(isValidCpf('11144477735')).toBe(true);
  });

  it('aceita CPF válido com máscara', () => {
    expect(isValidCpf('111.444.777-35')).toBe(true);
  });

  it('rejeita CPF com dígito verificador errado', () => {
    expect(isValidCpf('11144477736')).toBe(false);
  });

  it('rejeita sequência repetida', () => {
    expect(isValidCpf('111.111.111-11')).toBe(false);
  });

  it('rejeita tamanho incorreto', () => {
    expect(isValidCpf('123')).toBe(false);
  });
});

describe('isValidCnpj', () => {
  it('aceita CNPJ válido sem máscara', () => {
    expect(isValidCnpj('11222333000181')).toBe(true);
  });

  it('aceita CNPJ válido com máscara', () => {
    expect(isValidCnpj('11.222.333/0001-81')).toBe(true);
  });

  it('rejeita CNPJ com dígito verificador errado', () => {
    expect(isValidCnpj('11222333000182')).toBe(false);
  });

  it('rejeita sequência repetida', () => {
    expect(isValidCnpj('11.111.111/1111-11')).toBe(false);
  });
});

describe('@IsCpfCnpj', () => {
  class Alvo {
    @IsCpfCnpj()
    numDocumento: string;

    tipo?: Tipo;

    constructor(numDocumento: string, tipo?: Tipo) {
      this.numDocumento = numDocumento;
      this.tipo = tipo;
    }
  }

  const temErro = (numDocumento: string, tipo?: Tipo): boolean =>
    validateSync(new Alvo(numDocumento, tipo)).length > 0;

  it('aceita CPF válido quando tipo = pessoa_fisica', () => {
    expect(temErro('111.444.777-35', Tipo.pessoa_fisica)).toBe(false);
  });

  it('rejeita CNPJ quando tipo = pessoa_fisica', () => {
    expect(temErro('11.222.333/0001-81', Tipo.pessoa_fisica)).toBe(true);
  });

  it('aceita CNPJ válido quando tipo = pessoa_juridica', () => {
    expect(temErro('11.222.333/0001-81', Tipo.pessoa_juridica)).toBe(false);
  });

  it('rejeita CPF quando tipo = pessoa_juridica', () => {
    expect(temErro('111.444.777-35', Tipo.pessoa_juridica)).toBe(true);
  });

  it('sem tipo, aceita CPF ou CNPJ válido (update parcial)', () => {
    expect(temErro('111.444.777-35')).toBe(false);
    expect(temErro('11.222.333/0001-81')).toBe(false);
  });

  it('sem tipo, rejeita documento inválido', () => {
    expect(temErro('00000000000')).toBe(true);
  });
});
