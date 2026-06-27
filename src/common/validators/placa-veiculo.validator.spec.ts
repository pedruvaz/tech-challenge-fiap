import { validateSync } from 'class-validator';
import { IsPlacaVeiculo, isValidPlaca } from './placa-veiculo.validator';

describe('isValidPlaca', () => {
  it('aceita placa antiga sem hífen', () => {
    expect(isValidPlaca('ABC1234')).toBe(true);
  });

  it('aceita placa antiga com hífen', () => {
    expect(isValidPlaca('ABC-1234')).toBe(true);
  });

  it('aceita placa Mercosul', () => {
    expect(isValidPlaca('ABC1D23')).toBe(true);
  });

  it('aceita placa em minúsculas (normaliza)', () => {
    expect(isValidPlaca('abc1d23')).toBe(true);
  });

  it('aceita placa com espaços (normaliza)', () => {
    expect(isValidPlaca(' ABC 1D23 ')).toBe(true);
  });

  it('rejeita placa com letras a mais', () => {
    expect(isValidPlaca('ABCD1234')).toBe(false);
  });

  it('rejeita placa com dígitos a mais', () => {
    expect(isValidPlaca('ABC12345')).toBe(false);
  });

  it('rejeita string vazia', () => {
    expect(isValidPlaca('')).toBe(false);
  });

  it('rejeita placa com apenas 2 letras iniciais', () => {
    expect(isValidPlaca('AB1A23')).toBe(false);
  });
});

describe('@IsPlacaVeiculo', () => {
  class Alvo {
    @IsPlacaVeiculo()
    placa: unknown;

    constructor(placa: unknown) {
      this.placa = placa;
    }
  }

  const temErro = (placa: unknown): boolean =>
    validateSync(new Alvo(placa)).length > 0;

  it('aceita placa antiga válida', () => {
    expect(temErro('ABC-1234')).toBe(false);
  });

  it('aceita placa Mercosul válida', () => {
    expect(temErro('ABC1D23')).toBe(false);
  });

  it('rejeita placa inválida', () => {
    expect(temErro('XXXXXX')).toBe(true);
  });

  it('rejeita valor que não é string', () => {
    expect(temErro(12345)).toBe(true);
  });
});
