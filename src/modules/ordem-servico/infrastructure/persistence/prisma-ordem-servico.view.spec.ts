import { PrismaTransactionContext } from './prisma-transaction-context';
import { PrismaOrdemServicoView } from './prisma-ordem-servico.view';

const decimal = (n: number) => ({ toNumber: () => n });

const linhaCompleta = (over: Record<string, unknown> = {}) => ({
  osId: 'os-1',
  usuarioId: 3,
  clienteId: 'c1',
  veiculoId: 'v1',
  status: 'em_execucao',
  valorFinal: decimal(250.5),
  criadoEm: new Date('2024-01-01T00:00:00Z'),
  atualizadoEm: new Date('2024-02-01T00:00:00Z'),
  deletadoEm: null,
  mecanico: { idUsuario: 3, nome: 'Carlos' },
  cliente: { clienteId: 'c1', nome: 'Maria', numDocumento: '111.444.777-35' },
  veiculo: {
    veiculoId: 'v1',
    placa: 'ABC1D23',
    marca: 'Toyota',
    modelo: 'Corolla',
  },
  servicosRealizados: [
    {
      servicoId: 5,
      quantidade: 1,
      valor: decimal(120),
      servico: { descricao: 'Troca de óleo' },
    },
  ],
  pecasUtilizadas: [
    { pecaId: 42, qtd: 2, valor: decimal(9.9), peca: { nome: 'Vela' } },
  ],
  insumosConsumidos: [
    {
      insumoId: 7,
      qtdConsumida: 4,
      valor: decimal(45),
      insumo: { nome: 'Óleo 5W30' },
    },
  ],
  ...over,
});

const linhaMinima = (over: Record<string, unknown> = {}) =>
  linhaCompleta({
    mecanico: null,
    cliente: null,
    veiculo: null,
    servicosRealizados: [],
    pecasUtilizadas: [],
    insumosConsumidos: [],
    ...over,
  });

function montar() {
  const ordemServico = { findFirst: jest.fn(), findMany: jest.fn() };
  const ctx = {
    cliente: jest.fn().mockReturnValue({ ordemServico }),
  } as unknown as PrismaTransactionContext;

  return { view: new PrismaOrdemServicoView(ctx), ordemServico };
}

describe('PrismaOrdemServicoView', () => {
  describe('buscarPorId', () => {
    it('filtra por deletadoEm null e projeta a linha completa', async () => {
      const { view, ordemServico } = montar();
      ordemServico.findFirst.mockResolvedValue(linhaCompleta());

      const projecao = await view.buscarPorId('os-1');

      expect(ordemServico.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { osId: 'os-1', deletadoEm: null } }),
      );
      expect(projecao).toMatchObject({
        osId: 'os-1',
        status: 'em_execucao',
        valorFinal: 250.5,
      });
      expect(projecao?.mecanico).toEqual({ idUsuario: 3, nome: 'Carlos' });
      expect(projecao?.cliente?.numDocumento).toBe('111.444.777-35');
      expect(projecao?.veiculo?.placa).toBe('ABC1D23');
    });

    it('devolve null quando a OS não existe', async () => {
      const { view, ordemServico } = montar();
      ordemServico.findFirst.mockResolvedValue(null);

      await expect(view.buscarPorId('sumiu')).resolves.toBeNull();
    });

    it('projeta null nos relacionamentos ausentes', async () => {
      const { view, ordemServico } = montar();
      ordemServico.findFirst.mockResolvedValue(linhaMinima());

      const projecao = await view.buscarPorId('os-1');

      expect(projecao?.mecanico).toBeNull();
      expect(projecao?.cliente).toBeNull();
      expect(projecao?.veiculo).toBeNull();
      expect(projecao?.servicosRealizados).toEqual([]);
    });

    it('achata descrição, nome de peça e de insumo nas linhas', async () => {
      const { view, ordemServico } = montar();
      ordemServico.findFirst.mockResolvedValue(linhaCompleta());

      const projecao = await view.buscarPorId('os-1');

      expect(projecao?.servicosRealizados[0]).toEqual({
        servicoId: 5,
        descricao: 'Troca de óleo',
        quantidade: 1,
        valor: 120,
      });
      expect(projecao?.pecasUtilizadas[0].nome).toBe('Vela');
      expect(projecao?.insumosConsumidos[0].nome).toBe('Óleo 5W30');
    });

    it('cai para string vazia quando o join do catálogo não veio', async () => {
      const { view, ordemServico } = montar();
      ordemServico.findFirst.mockResolvedValue(
        linhaCompleta({
          servicosRealizados: [
            { servicoId: 5, quantidade: 1, valor: 120, servico: null },
          ],
          pecasUtilizadas: [{ pecaId: 42, qtd: 2, valor: 9.9, peca: null }],
          insumosConsumidos: [
            { insumoId: 7, qtdConsumida: 4, valor: 45, insumo: null },
          ],
        }),
      );

      const projecao = await view.buscarPorId('os-1');

      expect(projecao?.servicosRealizados[0].descricao).toBe('');
      expect(projecao?.pecasUtilizadas[0].nome).toBe('');
      expect(projecao?.insumosConsumidos[0].nome).toBe('');
    });

    it.each([
      ['Decimal', decimal(99.9), 99.9],
      ['number', 99.9, 99.9],
      ['string', '99.9', 99.9],
    ])('converte valorFinal vindo como %s', async (_tipo, bruto, esperado) => {
      const { view, ordemServico } = montar();
      ordemServico.findFirst.mockResolvedValue(
        linhaMinima({ valorFinal: bruto }),
      );

      const projecao = await view.buscarPorId('os-1');

      expect(projecao?.valorFinal).toBe(esperado);
    });
  });

  describe('listar', () => {
    it('sem filtro de status, exclui finalizadas e entregues por padrão', async () => {
      const { view, ordemServico } = montar();
      ordemServico.findMany.mockResolvedValue([linhaMinima()]);

      const projecoes = await view.listar();

      expect(ordemServico.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            deletadoEm: null,
            status: { notIn: ['finalizada', 'entregue'] },
          },
        }),
      );
      expect(projecoes).toHaveLength(1);
    });

    it('ordena por prioridade de status e, no mesmo status, mais antigas primeiro', async () => {
      const { view, ordemServico } = montar();
      const d = (dia: number) => new Date(2026, 7, dia);
      ordemServico.findMany.mockResolvedValue([
        linhaMinima({ osId: 'recebida-1', status: 'recebida', criadoEm: d(1) }),
        linhaMinima({
          osId: 'exec-nova',
          status: 'em_execucao',
          criadoEm: d(20),
        }),
        linhaMinima({
          osId: 'diag-1',
          status: 'em_diagnostico',
          criadoEm: d(5),
        }),
        linhaMinima({
          osId: 'exec-velha',
          status: 'em_execucao',
          criadoEm: d(2),
        }),
        linhaMinima({
          osId: 'aguard-1',
          status: 'aguardando_aprovacao',
          criadoEm: d(3),
        }),
        linhaMinima({
          osId: 'rejeitada-1',
          status: 'rejeitada',
          criadoEm: d(1),
        }),
      ]);

      const projecoes = await view.listar();

      expect(projecoes.map((os) => os.osId)).toEqual([
        'exec-velha', // em_execucao mais antiga primeiro
        'exec-nova',
        'aguard-1',
        'diag-1',
        'recebida-1',
        'rejeitada-1', // terminal: depois de tudo que ainda anda
      ]);
    });

    it('filtro explícito de status sobrepõe a exclusão padrão', async () => {
      const { view, ordemServico } = montar();
      ordemServico.findMany.mockResolvedValue([]);

      await view.listar({ status: 'finalizada' });

      expect(ordemServico.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletadoEm: null, status: 'finalizada' },
        }),
      );
    });

    it('aplica o filtro de status', async () => {
      const { view, ordemServico } = montar();
      ordemServico.findMany.mockResolvedValue([]);

      await view.listar({ status: 'em_execucao' });

      expect(ordemServico.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletadoEm: null, status: 'em_execucao' },
        }),
      );
    });

    it('aplica o filtro de cliente', async () => {
      const { view, ordemServico } = montar();
      ordemServico.findMany.mockResolvedValue([]);

      await view.listar({ clienteId: 'c1' });

      expect(ordemServico.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            deletadoEm: null,
            status: { notIn: ['finalizada', 'entregue'] },
            clienteId: 'c1',
          },
        }),
      );
    });

    it('combina os dois filtros', async () => {
      const { view, ordemServico } = montar();
      ordemServico.findMany.mockResolvedValue([]);

      await view.listar({ status: 'finalizada', clienteId: 'c1' });

      expect(ordemServico.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            deletadoEm: null,
            status: 'finalizada',
            clienteId: 'c1',
          },
        }),
      );
    });

    it('ignora filtros vazios em vez de mandá-los ao Prisma', async () => {
      const { view, ordemServico } = montar();
      ordemServico.findMany.mockResolvedValue([]);

      await view.listar({ status: undefined, clienteId: undefined });

      expect(ordemServico.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            deletadoEm: null,
            status: { notIn: ['finalizada', 'entregue'] },
          },
        }),
      );
    });

    it('devolve lista vazia quando não há OS', async () => {
      const { view, ordemServico } = montar();
      ordemServico.findMany.mockResolvedValue([]);

      await expect(view.listar()).resolves.toEqual([]);
    });
  });
});
