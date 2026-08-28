import { BadRequestException } from '@nestjs/common';
import { ArgumentMetadata } from '@nestjs/common';
import { ParseIdPipe } from './parse-id.pipe';

describe('ParseIdPipe', () => {
  let pipe: ParseIdPipe;

  const metadata: ArgumentMetadata = {
    type: 'param',
    data: 'id',
  };

  beforeEach(() => {
    pipe = new ParseIdPipe();
  });

  it('deve converter uma string numérica válida para número', () => {
    expect(pipe.transform('1', metadata)).toBe(1);
    expect(pipe.transform('42', metadata)).toBe(42);
    expect(pipe.transform('2147483647', metadata)).toBe(2147483647);
  });

  it('deve lançar BadRequestException para string não numérica', () => {
    expect(() => pipe.transform('abc', metadata)).toThrow(BadRequestException);
    expect(() => pipe.transform('1a', metadata)).toThrow(BadRequestException);
    expect(() => pipe.transform('', metadata)).toThrow(BadRequestException);
  });

  it('deve lançar BadRequestException para número decimal', () => {
    expect(() => pipe.transform('1.5', metadata)).toThrow(BadRequestException);
  });

  it('deve lançar BadRequestException para número acima do MAX_SAFE_ID', () => {
    expect(() => pipe.transform('2147483648', metadata)).toThrow(
      BadRequestException,
    );
  });

  it('deve incluir o nome do parâmetro na mensagem de erro para string inválida', () => {
    expect(() => pipe.transform('abc', metadata)).toThrow(
      `O parâmetro "id" deve ser um número inteiro válido.`,
    );
  });

  it('deve incluir o limite máximo na mensagem de erro para número acima do permitido', () => {
    expect(() => pipe.transform('2147483648', metadata)).toThrow(
      `O parâmetro "id" excede o valor máximo permitido (2147483647).`,
    );
  });
});
