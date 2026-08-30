import {
  StatusOS,
  compararParaListagem,
  STATUS_FORA_DA_LISTAGEM,
} from './status-os.vo';

describe('StatusOS', () => {
  it('nasce em recebida', () => {
    expect(StatusOS.recebida().valor).toBe('recebida');
  });

  it('define transições sequenciais', () => {
    expect(StatusOS.de('recebida').proximoValido()).toBe('em_diagnostico');
    expect(StatusOS.de('em_diagnostico').proximoValido()).toBe(
      'aguardando_aprovacao',
    );
    expect(StatusOS.de('aguardando_aprovacao').proximoValido()).toBe(
      'em_execucao',
    );
    expect(StatusOS.de('em_execucao').proximoValido()).toBe('finalizada');
    expect(StatusOS.de('finalizada').proximoValido()).toBe('entregue');
    expect(StatusOS.de('entregue').proximoValido()).toBeNull();
  });

  it('só aceita a transição imediata seguinte', () => {
    const s = StatusOS.de('recebida');
    expect(s.podeTransicionarPara('em_diagnostico')).toBe(true);
    expect(s.podeTransicionarPara('em_execucao')).toBe(false);
    expect(s.podeTransicionarPara('recebida')).toBe(false);
  });

  it('bloqueia edição de itens em finalizada e entregue', () => {
    expect(StatusOS.de('recebida').aceitaEdicaoDeItens()).toBe(true);
    expect(StatusOS.de('em_execucao').aceitaEdicaoDeItens()).toBe(true);
    expect(StatusOS.de('finalizada').aceitaEdicaoDeItens()).toBe(false);
    expect(StatusOS.de('entregue').aceitaEdicaoDeItens()).toBe(false);
  });

  it('identifica aguardando aprovação', () => {
    expect(StatusOS.de('aguardando_aprovacao').estaAguardandoAprovacao()).toBe(
      true,
    );
    expect(StatusOS.de('em_execucao').estaAguardandoAprovacao()).toBe(false);
  });
});

describe('StatusOS.igual', () => {
  it('é verdadeiro para o mesmo status', () => {
    expect(StatusOS.recebida().igual(StatusOS.de('recebida'))).toBe(true);
  });

  it('é falso para status diferentes', () => {
    expect(StatusOS.recebida().igual(StatusOS.de('finalizada'))).toBe(false);
  });
});

describe('regras da listagem', () => {
  const os = (
    status: Parameters<typeof compararParaListagem>[0]['status'],
    dia: number,
  ) => ({
    status,
    criadoEm: new Date(2026, 7, dia),
  });

  it('prioriza em_execucao > aguardando_aprovacao > em_diagnostico > recebida', () => {
    const embaralhado = [
      os('recebida', 1),
      os('em_diagnostico', 1),
      os('em_execucao', 1),
      os('aguardando_aprovacao', 1),
    ];

    const ordenado = [...embaralhado].sort(compararParaListagem);

    expect(ordenado.map((o) => o.status)).toEqual([
      'em_execucao',
      'aguardando_aprovacao',
      'em_diagnostico',
      'recebida',
    ]);
  });

  it('dentro do mesmo status, mais antigas primeiro', () => {
    const ordenado = [
      os('recebida', 20),
      os('recebida', 2),
      os('recebida', 9),
    ].sort(compararParaListagem);

    expect(ordenado.map((o) => o.criadoEm.getDate())).toEqual([2, 9, 20]);
  });

  it('rejeitada vai para depois de tudo que ainda anda', () => {
    const ordenado = [os('rejeitada', 1), os('recebida', 30)].sort(
      compararParaListagem,
    );

    expect(ordenado[0].status).toBe('recebida');
  });

  it('a exclusão padrão cobre exatamente finalizada e entregue', () => {
    // 'rejeitada' fica de fora da exclusão de propósito: a oficina precisa
    // ver o que o cliente recusou. Se alguém a incluir aqui, este teste
    // obriga a decisão a ser consciente.
    expect([...STATUS_FORA_DA_LISTAGEM]).toEqual(['finalizada', 'entregue']);
  });
});
