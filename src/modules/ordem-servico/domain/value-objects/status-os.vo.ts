export type StatusOSValor =
  | 'recebida'
  | 'em_diagnostico'
  | 'aguardando_aprovacao'
  | 'em_execucao'
  | 'finalizada'
  | 'entregue';

const TRANSICOES_VALIDAS: Record<StatusOSValor, StatusOSValor | null> = {
  recebida: 'em_diagnostico',
  em_diagnostico: 'aguardando_aprovacao',
  aguardando_aprovacao: 'em_execucao',
  em_execucao: 'finalizada',
  finalizada: 'entregue',
  entregue: null,
};

const STATUS_BLOQUEADOS_PARA_ITENS: StatusOSValor[] = ['finalizada', 'entregue'];

export class StatusOS {
  private constructor(private readonly _valor: StatusOSValor) {}

  static recebida(): StatusOS {
    return new StatusOS('recebida');
  }

  static de(valor: StatusOSValor): StatusOS {
    return new StatusOS(valor);
  }

  get valor(): StatusOSValor {
    return this._valor;
  }

  proximoValido(): StatusOSValor | null {
    return TRANSICOES_VALIDAS[this._valor];
  }

  podeTransicionarPara(novo: StatusOSValor): boolean {
    return TRANSICOES_VALIDAS[this._valor] === novo;
  }

  aceitaEdicaoDeItens(): boolean {
    return !STATUS_BLOQUEADOS_PARA_ITENS.includes(this._valor);
  }

  estaAguardandoAprovacao(): boolean {
    return this._valor === 'aguardando_aprovacao';
  }

  igual(outro: StatusOS): boolean {
    return this._valor === outro._valor;
  }
}
