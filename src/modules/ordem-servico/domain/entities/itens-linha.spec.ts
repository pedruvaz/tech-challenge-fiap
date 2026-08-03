import { Dinheiro } from '../value-objects/dinheiro.vo';
import { InsumoConsumido } from './insumo-consumido.entity';
import { PecaUtilizada } from './peca-utilizada.entity';
import { ServicoRealizado } from './servico-realizado.entity';

describe('Itens de linha da OS', () => {
  it('ServicoRealizado calcula total = valor × quantidade', () => {
    const sr = new ServicoRealizado(1, 3, Dinheiro.deNumero(15));
    expect(sr.totalLinha().paraNumero()).toBe(45);
  });

  it('ServicoRealizado rejeita quantidade não positiva', () => {
    expect(() => new ServicoRealizado(1, 0, Dinheiro.deNumero(1))).toThrow();
    expect(() => new ServicoRealizado(1, -1, Dinheiro.deNumero(1))).toThrow();
    expect(() => new ServicoRealizado(1, 1.5, Dinheiro.deNumero(1))).toThrow();
  });

  it('PecaUtilizada calcula total', () => {
    const pu = new PecaUtilizada(2, 4, Dinheiro.deNumero(2.5));
    expect(pu.totalLinha().paraNumero()).toBe(10);
  });

  it('PecaUtilizada rejeita quantidade não positiva', () => {
    expect(() => new PecaUtilizada(1, 0, Dinheiro.deNumero(1))).toThrow();
  });

  it('InsumoConsumido calcula total', () => {
    const ic = new InsumoConsumido(3, 2, Dinheiro.deNumero(7.5));
    expect(ic.totalLinha().paraNumero()).toBe(15);
  });

  it('InsumoConsumido rejeita quantidade não positiva', () => {
    expect(() => new InsumoConsumido(1, 0, Dinheiro.deNumero(1))).toThrow();
  });
});
