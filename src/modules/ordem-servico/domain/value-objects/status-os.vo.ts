export type StatusOSValor =
  | 'recebida'
  | 'em_diagnostico'
  | 'aguardando_aprovacao'
  | 'em_execucao'
  | 'finalizada'
  | 'entregue'
  | 'rejeitada';

const TRANSICOES_VALIDAS: Record<StatusOSValor, StatusOSValor | null> = {
  recebida: 'em_diagnostico',
  em_diagnostico: 'aguardando_aprovacao',
  aguardando_aprovacao: 'em_execucao',
  em_execucao: 'finalizada',
  finalizada: 'entregue',
  entregue: null,
  rejeitada: null,
};

const STATUS_BLOQUEADOS_PARA_ITENS: StatusOSValor[] = [
  'finalizada',
  'entregue',
  'rejeitada',
];

// ── Regras da listagem (requisito da fase) ─────────────────────────────────
// "Em Execução > Aguardando Aprovação > Diagnóstico > Recebida, mais antigas
// primeiro, excluindo finalizadas e entregues (exclusão lógica)".

/** Fora da listagem padrão; continuam acessíveis via filtro explícito. */
export const STATUS_FORA_DA_LISTAGEM: readonly StatusOSValor[] = [
  'finalizada',
  'entregue',
];

// 'rejeitada' não existe no enunciado (foi adicionada pelo fluxo de e-mail):
// fica visível — a oficina precisa saber o que o cliente recusou — mas depois
// de 'recebida', por ser terminal. 'finalizada'/'entregue' só aparecem via
// filtro explícito; a posição aqui é para essa consulta não ficar sem ordem.
const PRIORIDADE_LISTAGEM: Record<StatusOSValor, number> = {
  em_execucao: 0,
  aguardando_aprovacao: 1,
  em_diagnostico: 2,
  recebida: 3,
  rejeitada: 4,
  finalizada: 5,
  entregue: 6,
};

/** Ordena por prioridade de status e, dentro do status, mais antigas primeiro. */
export function compararParaListagem(
  a: { status: StatusOSValor; criadoEm: Date },
  b: { status: StatusOSValor; criadoEm: Date },
): number {
  const porStatus =
    PRIORIDADE_LISTAGEM[a.status] - PRIORIDADE_LISTAGEM[b.status];
  if (porStatus !== 0) return porStatus;
  return a.criadoEm.getTime() - b.criadoEm.getTime();
}

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
