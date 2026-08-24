import { StatusOS } from './status-os.vo';

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
