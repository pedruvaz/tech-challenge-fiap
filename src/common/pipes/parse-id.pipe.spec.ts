import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ParseIdPipe } from './parse-id.pipe';

const meta: ArgumentMetadata = { type: 'param', data: 'id' };

describe('ParseIdPipe', () => {
  const pipe = new ParseIdPipe();

  it.each([
    ['1', 1],
    ['42', 42],
    ['0', 0],
    ['2147483647', 2147483647],
  ])('converte "%s" para o número %i', (entrada, esperado) => {
    expect(pipe.transform(entrada, meta)).toBe(esperado);
  });

  it.each(['', 'abc', '1.5', '-1', '1e3', ' 1', '1 ', '0x10'])(
    'rejeita a entrada não inteira "%s"',
    (entrada) => {
      expect(() => pipe.transform(entrada, meta)).toThrow(BadRequestException);
    },
  );

  it('nomeia o parâmetro na mensagem de erro', () => {
    expect(() => pipe.transform('abc', meta)).toThrow(
      'O parâmetro "id" deve ser um número inteiro válido.',
    );
  });

  it('rejeita valores acima do máximo de int32 do banco', () => {
    expect(() => pipe.transform('2147483648', meta)).toThrow(
      'excede o valor máximo permitido (2147483647)',
    );
  });

  it('rejeita inteiros fora da faixa segura do JS', () => {
    expect(() => pipe.transform('99999999999999999999', meta)).toThrow(
      BadRequestException,
    );
  });
});
