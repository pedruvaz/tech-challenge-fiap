import { reconstituirServico } from './servico.mapper';

const linha = (over: Record<string, unknown> = {}) =>
  ({
    servicoId: 42,
    descricao: 'Troca de óleo',
    valor: 120,
    criadoEm: new Date('2024-01-01T00:00:00Z'),
    atualizadoEm: new Date('2024-02-01T00:00:00Z'),
    deletadoEm: null,
    ...over,
  }) as unknown as Parameters<typeof reconstituirServico>[0];

describe('reconstituirServico', () => {
  it('mapeia a linha do Prisma para a entidade de domínio', () => {
    const alvo = reconstituirServico(linha());

    expect(alvo.servicoId).toBe(42);
    expect(alvo.descricao).toBe('Troca de óleo');
    expect(alvo.valor).toBe(120);
    expect(alvo.foiCriadoAgora).toBe(false);
  });

  it('converte Decimal do Prisma para number', () => {
    const decimal = { toString: () => '39.9', valueOf: () => 39.9 };
    const alvo = reconstituirServico(linha({ valor: decimal }));

    expect(typeof alvo.valor).toBe('number');
    expect(alvo.valor).toBe(39.9);
  });

  it('propaga deletadoEm de registros com soft delete', () => {
    const deletadoEm = new Date('2024-03-01T00:00:00Z');

    expect(reconstituirServico(linha({ deletadoEm })).deletadoEm).toEqual(
      deletadoEm,
    );
  });
});
