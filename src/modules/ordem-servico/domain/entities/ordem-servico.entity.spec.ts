import { AprovacaoInvalidaException } from '../exceptions/aprovacao-invalida.exception';
import { OsNaoEditavelException } from '../exceptions/os-nao-editavel.exception';
import { TransicaoInvalidaException } from '../exceptions/transicao-invalida.exception';
import { Dinheiro } from '../value-objects/dinheiro.vo';
import { StatusOS } from '../value-objects/status-os.vo';
import { InsumoConsumido } from './insumo-consumido.entity';
import { OrdemServico } from './ordem-servico.entity';
import { PecaUtilizada } from './peca-utilizada.entity';
import { ServicoRealizado } from './servico-realizado.entity';

const props = {
  osId: 'os-1',
  mecanicoId: 1,
  clienteId: 'cli-1',
  veiculoId: 'vei-1',
};

function novaOs() {
  return OrdemServico.criar(props);
}

describe('OrdemServico — criação', () => {
  it('nasce em recebida com uma transição pendente inicial', () => {
    const os = novaOs();
    expect(os.status.valor).toBe('recebida');
    expect(os.foiCriadaAgora).toBe(true);
    expect(os.transicoesPendentes.length).toBe(1);
    expect(os.transicoesPendentes[0]).toEqual({
      statusAnterior: null,
      statusNovo: 'recebida',
      usuarioId: 1,
    });
  });

  it('inicia com valorFinal zero', () => {
    expect(novaOs().valorFinal().paraNumero()).toBe(0);
  });
});

describe('OrdemServico — itens', () => {
  it('aplica serviço/peça/insumo e recalcula valorFinal', () => {
    const os = novaOs();
    os.aplicarServico(new ServicoRealizado(10, 2, Dinheiro.deNumero(50)));
    os.aplicarPeca(new PecaUtilizada(20, 3, Dinheiro.deNumero(10)));
    os.aplicarInsumo(new InsumoConsumido(30, 1, Dinheiro.deNumero(5.5)));
    expect(os.valorFinal().paraNumero()).toBe(50 * 2 + 10 * 3 + 5.5);
  });

  it('upsert de serviço atualiza a quantidade sem duplicar', () => {
    const os = novaOs();
    os.aplicarServico(new ServicoRealizado(10, 1, Dinheiro.deNumero(50)));
    os.aplicarServico(new ServicoRealizado(10, 3, Dinheiro.deNumero(50)));
    expect(os.servicos.length).toBe(1);
    expect(os.quantidadeDeServico(10)).toBe(3);
  });

  it('remove item existente', () => {
    const os = novaOs();
    os.aplicarPeca(new PecaUtilizada(20, 1, Dinheiro.deNumero(10)));
    os.removerPeca(20);
    expect(os.pecas.length).toBe(0);
    expect(os.quantidadeDePeca(20)).toBe(0);
  });

  it('bloqueia edição quando status é finalizada', () => {
    const os = OrdemServico.reconstituir({
      osId: 'os-1',
      mecanicoId: 1,
      clienteId: 'c',
      veiculoId: 'v',
      status: StatusOS.de('finalizada'),
      criadoEm: new Date(),
      atualizadoEm: new Date(),
      deletadoEm: null,
      servicos: [],
      pecas: [],
      insumos: [],
    });
    expect(() =>
      os.aplicarServico(new ServicoRealizado(1, 1, Dinheiro.deNumero(5))),
    ).toThrow(OsNaoEditavelException);
    expect(() =>
      os.aplicarPeca(new PecaUtilizada(1, 1, Dinheiro.deNumero(5))),
    ).toThrow(OsNaoEditavelException);
    expect(() =>
      os.aplicarInsumo(new InsumoConsumido(1, 1, Dinheiro.deNumero(5))),
    ).toThrow(OsNaoEditavelException);
  });
});

describe('OrdemServico — status', () => {
  it('avança em cadeia válida', () => {
    const os = novaOs();
    os.avancarStatus('em_diagnostico');
    expect(os.status.valor).toBe('em_diagnostico');
    os.avancarStatus('aguardando_aprovacao');
    expect(os.status.valor).toBe('aguardando_aprovacao');
    expect(os.transicoesPendentes.length).toBe(3);
  });

  it('recusa saltar etapas', () => {
    const os = novaOs();
    expect(() => os.avancarStatus('em_execucao')).toThrow(
      TransicaoInvalidaException,
    );
  });

  it('recusa avançar a partir de entregue (terminal)', () => {
    const os = OrdemServico.reconstituir({
      osId: 'os-1',
      mecanicoId: 1,
      clienteId: 'c',
      veiculoId: 'v',
      status: StatusOS.de('entregue'),
      criadoEm: new Date(),
      atualizadoEm: new Date(),
      deletadoEm: null,
      servicos: [],
      pecas: [],
      insumos: [],
    });
    expect(() => os.avancarStatus('entregue')).toThrow(
      TransicaoInvalidaException,
    );
  });

  it('aprova orçamento apenas quando aguardando aprovação', () => {
    const os = OrdemServico.reconstituir({
      osId: 'os-1',
      mecanicoId: 1,
      clienteId: 'c',
      veiculoId: 'v',
      status: StatusOS.de('aguardando_aprovacao'),
      criadoEm: new Date(),
      atualizadoEm: new Date(),
      deletadoEm: null,
      servicos: [],
      pecas: [],
      insumos: [],
    });
    os.aprovarOrcamento(42);
    expect(os.status.valor).toBe('em_execucao');
    expect(os.transicoesPendentes[0]).toEqual({
      statusAnterior: 'aguardando_aprovacao',
      statusNovo: 'em_execucao',
      usuarioId: 42,
    });
  });

  it('recusa aprovação em outros status', () => {
    const os = novaOs();
    expect(() => os.aprovarOrcamento()).toThrow(AprovacaoInvalidaException);
  });
});

describe('OrdemServico — soft delete', () => {
  it('marca deletadoEm', () => {
    const os = novaOs();
    const antes = os.deletadoEm;
    os.softDelete();
    expect(antes).toBeNull();
    expect(os.deletadoEm).toBeInstanceOf(Date);
  });
});

describe('OrdemServico.atualizadoEm', () => {
  it('nasce igual a criadoEm e avança a cada mutação', () => {
    const os = OrdemServico.criar({
      osId: 'os-1',
      mecanicoId: 1,
      clienteId: 'c1',
      veiculoId: 'v1',
    });
    expect(os.atualizadoEm).toEqual(os.criadoEm);

    const antes = os.atualizadoEm;
    jest.useFakeTimers().setSystemTime(antes.getTime() + 60_000);
    os.avancarStatus('em_diagnostico');
    jest.useRealTimers();

    expect(os.atualizadoEm.getTime()).toBeGreaterThan(antes.getTime());
  });
});
