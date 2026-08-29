import { reconstituirPeca } from './peca.mapper';

const linha = (over: Record<string, unknown> = {}) =>
  ({
    pecaId: 42,
    nome: 'Filtro de óleo',
    qtdEstoque: 10,
    valorUn: 39.9,
    criadoEm: new Date('2024-01-01T00:00:00Z'),
    atualizadoEm: new Date('2024-02-01T00:00:00Z'),
    deletadoEm: null,
    ...over,
  }) as unknown as Parameters<typeof reconstituirPeca>[0];

describe('reconstituirPeca', () => {
  it('mapeia a linha do Prisma para a entidade de domínio', () => {
    const alvo = reconstituirPeca(linha());

    expect(alvo.pecaId).toBe(42);
    expect(alvo.nome).toBe('Filtro de óleo');
    expect(alvo.qtdEstoque).toBe(10);
    expect(alvo.valorUn).toBe(39.9);
    expect(alvo.foiCriadoAgora).toBe(false);
  });

  it('converte Decimal do Prisma para number', () => {
    const decimal = { toString: () => '39.9', valueOf: () => 39.9 };
    const alvo = reconstituirPeca(linha({ valorUn: decimal }));

    expect(typeof alvo.valorUn).toBe('number');
    expect(alvo.valorUn).toBe(39.9);
  });

  it('propaga deletadoEm de registros com soft delete', () => {
    const deletadoEm = new Date('2024-03-01T00:00:00Z');

    expect(reconstituirPeca(linha({ deletadoEm })).deletadoEm).toEqual(
      deletadoEm,
    );
  });
});
