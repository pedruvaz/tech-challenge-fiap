import { reconstituirOrdemServico } from './ordem-servico.mapper';

const decimal = (n: number) => ({ toNumber: () => n });

const raw = (over: Record<string, unknown> = {}) =>
  ({
    osId: 'os-1',
    usuarioId: 3,
    clienteId: 'c1',
    veiculoId: 'v1',
    status: 'em_execucao',
    criadoEm: new Date('2024-01-01T00:00:00Z'),
    atualizadoEm: new Date('2024-02-01T00:00:00Z'),
    deletadoEm: null,
    ...over,
  }) as unknown as Parameters<typeof reconstituirOrdemServico>[0];

describe('reconstituirOrdemServico', () => {
  it('mapeia a raiz do agregado a partir da linha do Prisma', () => {
    const os = reconstituirOrdemServico(raw());

    expect(os.osId).toBe('os-1');
    expect(os.mecanicoId).toBe(3);
    expect(os.clienteId).toBe('c1');
    expect(os.veiculoId).toBe('v1');
    expect(os.status.valor).toBe('em_execucao');
    expect(os.deletadoEm).toBeNull();
  });

  it('trata coleções ausentes como vazias', () => {
    const os = reconstituirOrdemServico(raw());

    expect(os.quantidadeDeServico(5)).toBe(0);
    expect(os.quantidadeDePeca(42)).toBe(0);
    expect(os.quantidadeDeInsumo(7)).toBe(0);
  });

  it('hidrata as linhas de serviço, peça e insumo', () => {
    const os = reconstituirOrdemServico(
      raw({
        servicosRealizados: [
          { servicoId: 5, quantidade: 2, valor: decimal(120) },
        ],
        pecasUtilizadas: [{ pecaId: 42, qtd: 3, valor: decimal(9.9) }],
        insumosConsumidos: [
          { insumoId: 7, qtdConsumida: 4, valor: decimal(45) },
        ],
      }),
    );

    expect(os.quantidadeDeServico(5)).toBe(2);
    expect(os.quantidadeDePeca(42)).toBe(3);
    expect(os.quantidadeDeInsumo(7)).toBe(4);
  });

  it.each([
    ['Decimal', decimal(120), 120],
    ['number', 120, 120],
    ['string', '120.00', 120],
  ])('converte valor vindo como %s para Dinheiro', (_tipo, bruto, esperado) => {
    const os = reconstituirOrdemServico(
      raw({
        servicosRealizados: [{ servicoId: 5, quantidade: 1, valor: bruto }],
      }),
    );

    expect(os.valorFinal().paraNumero()).toBe(esperado);
  });

  it('preserva deletadoEm de OS removidas', () => {
    const deletadoEm = new Date('2024-03-01T00:00:00Z');

    expect(reconstituirOrdemServico(raw({ deletadoEm })).deletadoEm).toEqual(
      deletadoEm,
    );
  });

  it('reconstitui sem transições pendentes', () => {
    expect(reconstituirOrdemServico(raw()).transicoesPendentes).toEqual([]);
  });
});
