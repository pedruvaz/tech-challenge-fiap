import { Dinheiro } from './dinheiro.vo';

describe('Dinheiro', () => {
  it('cria zero e responde 0.00', () => {
    expect(Dinheiro.zero().paraNumero()).toBe(0);
    expect(Dinheiro.zero().paraString()).toBe('0.00');
  });

  it('constrói a partir de number com precisão de centavos', () => {
    expect(Dinheiro.deNumero(12.34).paraNumero()).toBe(12.34);
    expect(
      Dinheiro.deNumero(0.1).somar(Dinheiro.deNumero(0.2)).paraNumero(),
    ).toBe(0.3);
  });

  it('multiplica por quantidade inteira', () => {
    expect(Dinheiro.deNumero(19.99).multiplicar(3).paraNumero()).toBe(59.97);
    expect(Dinheiro.deNumero(10).multiplicar(0).paraNumero()).toBe(0);
  });

  it('rejeita quantidade não inteira ou negativa', () => {
    expect(() => Dinheiro.deNumero(10).multiplicar(1.5)).toThrow();
    expect(() => Dinheiro.deNumero(10).multiplicar(-1)).toThrow();
  });

  it('rejeita valores não finitos', () => {
    expect(() => Dinheiro.deNumero(NaN)).toThrow();
    expect(() => Dinheiro.deNumero(Infinity)).toThrow();
  });

  it('compara igualdade por valor', () => {
    expect(Dinheiro.deNumero(5).igual(Dinheiro.deNumero(5))).toBe(true);
    expect(Dinheiro.deNumero(5).igual(Dinheiro.deNumero(5.01))).toBe(false);
  });

  it('constrói a partir de string', () => {
    expect(Dinheiro.deString('42.50').paraNumero()).toBe(42.5);
  });
});
