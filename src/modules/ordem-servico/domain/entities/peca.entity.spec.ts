import { EstoqueInsuficienteException } from '../exceptions/estoque-insuficiente.exception';
import { Dinheiro } from '../value-objects/dinheiro.vo';
import { Peca } from './peca.entity';

function peca(estoque: number): Peca {
  return Peca.reconstituir({
    pecaId: 1,
    nome: 'Filtro',
    qtdEstoque: estoque,
    valorUn: Dinheiro.deNumero(20),
  });
}

describe('Peca — estoque', () => {
  it('reduz estoque em delta positivo', () => {
    const p = peca(10);
    p.ajustarEstoque(3);
    expect(p.qtdEstoque).toBe(7);
  });

  it('aumenta estoque em delta negativo (devolução)', () => {
    const p = peca(10);
    p.ajustarEstoque(-2);
    expect(p.qtdEstoque).toBe(12);
  });

  it('lança quando delta positivo excede estoque', () => {
    const p = peca(2);
    expect(() => p.ajustarEstoque(5)).toThrow(EstoqueInsuficienteException);
  });

  it('permite delta zero sem alteração', () => {
    const p = peca(10);
    p.ajustarEstoque(0);
    expect(p.qtdEstoque).toBe(10);
  });
});
