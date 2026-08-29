import { ServicoInvalidoException } from '../exceptions/servico-invalido.exception';
import { Servico } from './servico.entity';

const props = { descricao: 'Troca de óleo', valor: 120 };

describe('Servico (entidade)', () => {
  it('nasce sem id (o banco atribui) e marcado como recém-criado', () => {
    const alvo = Servico.criar(props);

    expect(alvo.servicoId).toBeNull();
    expect(alvo.descricao).toBe('Troca de óleo');
    expect(alvo.valor).toBe(120);
    expect(alvo.foiCriadoAgora).toBe(true);
    expect(alvo.deletadoEm).toBeNull();
    expect(alvo.criadoEm).toEqual(alvo.atualizadoEm);
  });

  it('reconstitui preservando id e timestamps', () => {
    const criadoEm = new Date('2024-01-01T00:00:00Z');
    const atualizadoEm = new Date('2024-02-01T00:00:00Z');

    const alvo = Servico.reconstituir({
      servicoId: 42,
      ...props,
      criadoEm,
      atualizadoEm,
      deletadoEm: null,
    });

    expect(alvo.servicoId).toBe(42);
    expect(alvo.criadoEm).toBe(criadoEm);
    expect(alvo.atualizadoEm).toBe(atualizadoEm);
    expect(alvo.foiCriadoAgora).toBe(false);
  });

  it('valida também na reconstituição (dado corrompido não passa)', () => {
    expect(() =>
      Servico.reconstituir({
        servicoId: 42,
        ...props,
        ...{ valor: -0.01 },
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        deletadoEm: null,
      }),
    ).toThrow(ServicoInvalidoException);
  });

  it('aplica todos os campos informados em alterar', () => {
    const alvo = Servico.criar(props);

    alvo.alterar({ descricao: 'Alinhamento', valor: 90 });

    expect(alvo.descricao).toBe('Alinhamento');
    expect(alvo.valor).toBe(90);
  });

  it('ignora campos ausentes em alterar (alteração parcial)', () => {
    const alvo = Servico.criar(props);

    alvo.alterar({ valor: 90 });

    expect(alvo.valor).toBe(90);
    expect(alvo.descricao).toBe('Troca de óleo');
  });

  it('move atualizadoEm mesmo sem alterações efetivas', () => {
    const alvo = Servico.criar(props);
    const antes = alvo.atualizadoEm;

    jest.useFakeTimers().setSystemTime(antes.getTime() + 60_000);
    alvo.alterar({});
    jest.useRealTimers();

    expect(alvo.atualizadoEm.getTime()).toBeGreaterThan(antes.getTime());
  });

  it('aceita quantidade/valor zero (fronteira permitida)', () => {
    expect(() => Servico.criar({ ...props, valor: 0 })).not.toThrow();
  });

  it('recusa descrição vazia na criação', () => {
    expect(() => Servico.criar({ ...props, ...{ descricao: '' } })).toThrow(
      ServicoInvalidoException,
    );
  });

  it('recusa descrição vazia na alteração', () => {
    const alvo = Servico.criar(props);
    expect(() => alvo.alterar({ descricao: '' })).toThrow(
      'A descrição do serviço deve conter no mínimo 2 caracteres.',
    );
  });

  it('recusa descrição com menos de 2 caracteres na criação', () => {
    expect(() => Servico.criar({ ...props, ...{ descricao: ' a ' } })).toThrow(
      ServicoInvalidoException,
    );
  });

  it('recusa descrição com menos de 2 caracteres na alteração', () => {
    const alvo = Servico.criar(props);
    expect(() => alvo.alterar({ descricao: ' a ' })).toThrow(
      'A descrição do serviço deve conter no mínimo 2 caracteres.',
    );
  });

  it('recusa valor negativo na criação', () => {
    expect(() => Servico.criar({ ...props, ...{ valor: -0.01 } })).toThrow(
      ServicoInvalidoException,
    );
  });

  it('recusa valor negativo na alteração', () => {
    const alvo = Servico.criar(props);
    expect(() => alvo.alterar({ valor: -0.01 })).toThrow(
      'O valor do serviço não pode ser negativo.',
    );
  });

  it('softDelete carimba o instante informado', () => {
    const alvo = Servico.criar(props);
    const agora = new Date('2025-05-05T10:00:00Z');

    alvo.softDelete(agora);

    expect(alvo.deletadoEm).toBe(agora);
    expect(alvo.atualizadoEm).toBe(agora);
  });

  it('softDelete usa o instante atual quando nenhum é informado', () => {
    const alvo = Servico.criar(props);

    alvo.softDelete();

    expect(alvo.deletadoEm).toBeInstanceOf(Date);
    expect(alvo.deletadoEm).toEqual(alvo.atualizadoEm);
  });
});
