import { EstoqueInsuficienteException } from '../exceptions/estoque-insuficiente.exception';
import { Dinheiro } from '../value-objects/dinheiro.vo';
import { Insumo } from './insumo.entity';

function insumo(estoque: number): Insumo {
  return Insumo.reconstituir({
    insumoId: 1,
    nome: 'Óleo',
    qtdEstoque: estoque,
    valorUn: Dinheiro.deNumero(30),
  });
}

describe('Insumo — estoque', () => {
  it('reduz estoque em delta positivo', () => {
    const i = insumo(10);
    i.ajustarEstoque(4);
    expect(i.qtdEstoque).toBe(6);
  });

  it('lança quando delta excede estoque', () => {
    const i = insumo(3);
    expect(() => i.ajustarEstoque(5)).toThrow(EstoqueInsuficienteException);
  });
});
