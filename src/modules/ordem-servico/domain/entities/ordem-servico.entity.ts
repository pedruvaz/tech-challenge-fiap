import { AprovacaoInvalidaException } from '../exceptions/aprovacao-invalida.exception';
import { OsNaoEditavelException } from '../exceptions/os-nao-editavel.exception';
import { TransicaoInvalidaException } from '../exceptions/transicao-invalida.exception';
import { Dinheiro } from '../value-objects/dinheiro.vo';
import { StatusOS, StatusOSValor } from '../value-objects/status-os.vo';
import { InsumoConsumido } from './insumo-consumido.entity';
import { PecaUtilizada } from './peca-utilizada.entity';
import { ServicoRealizado } from './servico-realizado.entity';

export type TransicaoPendente = {
  statusAnterior: StatusOSValor | null;
  statusNovo: StatusOSValor;
  usuarioId: number | null;
};

type ReconstituirProps = {
  osId: string;
  mecanicoId: number;
  clienteId: string;
  veiculoId: string;
  status: StatusOS;
  criadoEm: Date;
  atualizadoEm: Date;
  deletadoEm: Date | null;
  servicos: ServicoRealizado[];
  pecas: PecaUtilizada[];
  insumos: InsumoConsumido[];
};

type CriarProps = {
  osId: string;
  mecanicoId: number;
  clienteId: string;
  veiculoId: string;
};

export class OrdemServico {
  private _status: StatusOS;
  private _deletadoEm: Date | null;
  private readonly _servicos: Map<number, ServicoRealizado>;
  private readonly _pecas: Map<number, PecaUtilizada>;
  private readonly _insumos: Map<number, InsumoConsumido>;
  private readonly _transicoesPendentes: TransicaoPendente[] = [];
  private readonly _foiCriadaAgora: boolean;

  private constructor(
    readonly osId: string,
    readonly mecanicoId: number,
    readonly clienteId: string,
    readonly veiculoId: string,
    readonly criadoEm: Date,
    private _atualizadoEm: Date,
    status: StatusOS,
    deletadoEm: Date | null,
    servicos: ServicoRealizado[],
    pecas: PecaUtilizada[],
    insumos: InsumoConsumido[],
    foiCriadaAgora: boolean,
  ) {
    this._status = status;
    this._deletadoEm = deletadoEm;
    this._servicos = new Map(servicos.map((s) => [s.servicoId, s]));
    this._pecas = new Map(pecas.map((p) => [p.pecaId, p]));
    this._insumos = new Map(insumos.map((i) => [i.insumoId, i]));
    this._foiCriadaAgora = foiCriadaAgora;
  }

  static criar(props: CriarProps): OrdemServico {
    const agora = new Date();
    const os = new OrdemServico(
      props.osId,
      props.mecanicoId,
      props.clienteId,
      props.veiculoId,
      agora,
      agora,
      StatusOS.recebida(),
      null,
      [],
      [],
      [],
      true,
    );
    os._transicoesPendentes.push({
      statusAnterior: null,
      statusNovo: 'recebida',
      usuarioId: props.mecanicoId,
    });
    return os;
  }

  static reconstituir(props: ReconstituirProps): OrdemServico {
    return new OrdemServico(
      props.osId,
      props.mecanicoId,
      props.clienteId,
      props.veiculoId,
      props.criadoEm,
      props.atualizadoEm,
      props.status,
      props.deletadoEm,
      props.servicos,
      props.pecas,
      props.insumos,
      false,
    );
  }

  get status(): StatusOS {
    return this._status;
  }

  get deletadoEm(): Date | null {
    return this._deletadoEm;
  }

  get atualizadoEm(): Date {
    return this._atualizadoEm;
  }

  get servicos(): readonly ServicoRealizado[] {
    return Array.from(this._servicos.values());
  }

  get pecas(): readonly PecaUtilizada[] {
    return Array.from(this._pecas.values());
  }

  get insumos(): readonly InsumoConsumido[] {
    return Array.from(this._insumos.values());
  }

  get foiCriadaAgora(): boolean {
    return this._foiCriadaAgora;
  }

  get transicoesPendentes(): readonly TransicaoPendente[] {
    return this._transicoesPendentes;
  }

  valorFinal(): Dinheiro {
    const totalServicos = this.servicos.reduce(
      (acc, s) => acc.somar(s.totalLinha()),
      Dinheiro.zero(),
    );
    const totalPecas = this.pecas.reduce(
      (acc, p) => acc.somar(p.totalLinha()),
      Dinheiro.zero(),
    );
    const totalInsumos = this.insumos.reduce(
      (acc, i) => acc.somar(i.totalLinha()),
      Dinheiro.zero(),
    );
    return totalServicos.somar(totalPecas).somar(totalInsumos);
  }

  quantidadeDeServico(servicoId: number): number {
    return this._servicos.get(servicoId)?.quantidade ?? 0;
  }

  quantidadeDePeca(pecaId: number): number {
    return this._pecas.get(pecaId)?.qtd ?? 0;
  }

  quantidadeDeInsumo(insumoId: number): number {
    return this._insumos.get(insumoId)?.qtdConsumida ?? 0;
  }

  aplicarServico(item: ServicoRealizado): void {
    this.assertItensEditaveis();
    this._servicos.set(item.servicoId, item);
    this.marcarAtualizado();
  }

  removerServico(servicoId: number): void {
    this.assertItensEditaveis();
    this._servicos.delete(servicoId);
    this.marcarAtualizado();
  }

  aplicarPeca(item: PecaUtilizada): void {
    this.assertItensEditaveis();
    this._pecas.set(item.pecaId, item);
    this.marcarAtualizado();
  }

  removerPeca(pecaId: number): void {
    this.assertItensEditaveis();
    this._pecas.delete(pecaId);
    this.marcarAtualizado();
  }

  aplicarInsumo(item: InsumoConsumido): void {
    this.assertItensEditaveis();
    this._insumos.set(item.insumoId, item);
    this.marcarAtualizado();
  }

  removerInsumo(insumoId: number): void {
    this.assertItensEditaveis();
    this._insumos.delete(insumoId);
    this.marcarAtualizado();
  }

  avancarStatus(destino: StatusOSValor, usuarioId?: number): void {
    if (!this._status.podeTransicionarPara(destino)) {
      throw new TransicaoInvalidaException(
        this._status.valor,
        this._status.proximoValido(),
      );
    }
    this.aplicarTransicao(destino, usuarioId);
  }

  aprovarOrcamento(usuarioId?: number): void {
    if (!this._status.estaAguardandoAprovacao()) {
      throw new AprovacaoInvalidaException(this._status.valor);
    }
    this.aplicarTransicao('em_execucao', usuarioId);
  }

  softDelete(agora: Date = new Date()): void {
    this._deletadoEm = agora;
    this.marcarAtualizado(agora);
  }

  private aplicarTransicao(novo: StatusOSValor, usuarioId?: number): void {
    const anterior = this._status.valor;
    this._status = StatusOS.de(novo);
    this._transicoesPendentes.push({
      statusAnterior: anterior,
      statusNovo: novo,
      usuarioId: usuarioId ?? null,
    });
    this.marcarAtualizado();
  }

  private assertItensEditaveis(): void {
    if (!this._status.aceitaEdicaoDeItens()) {
      throw new OsNaoEditavelException(this._status.valor);
    }
  }

  private marcarAtualizado(agora: Date = new Date()): void {
    this._atualizadoEm = agora;
  }
}
