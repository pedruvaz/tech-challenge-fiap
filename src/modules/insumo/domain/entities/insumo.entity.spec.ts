import { InsumoInvalidoException } from '../exceptions/insumo-invalido.exception';
import { Insumo } from './insumo.entity';

const props = { nome: 'Filtro de óleo', qtdEstoque: 10, valorUn: 39.9 };

describe('Insumo (entidade)', () => {
  it('nasce sem id (o banco atribui) e marcado como recém-criado', () => {
    const alvo = Insumo.criar(props);

    expect(alvo.insumoId).toBeNull();
    expect(alvo.nome).toBe('Filtro de óleo');
    expect(alvo.qtdEstoque).toBe(10);
    expect(alvo.valorUn).toBe(39.9);
    expect(alvo.foiCriadoAgora).toBe(true);
    expect(alvo.deletadoEm).toBeNull();
    expect(alvo.criadoEm).toEqual(alvo.atualizadoEm);
  });

  it('reconstitui preservando id e timestamps', () => {
    const criadoEm = new Date('2024-01-01T00:00:00Z');
    const atualizadoEm = new Date('2024-02-01T00:00:00Z');

    const alvo = Insumo.reconstituir({
      insumoId: 42,
      ...props,
      criadoEm,
      atualizadoEm,
      deletadoEm: null,
    });

    expect(alvo.insumoId).toBe(42);
    expect(alvo.criadoEm).toBe(criadoEm);
    expect(alvo.atualizadoEm).toBe(atualizadoEm);
    expect(alvo.foiCriadoAgora).toBe(false);
  });

  it('valida também na reconstituição (dado corrompido não passa)', () => {
    expect(() =>
      Insumo.reconstituir({
        insumoId: 42,
        ...props,
        ...{ valorUn: -0.01 },
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        deletadoEm: null,
      }),
    ).toThrow(InsumoInvalidoException);
  });

  it('aplica todos os campos informados em alterar', () => {
    const alvo = Insumo.criar(props);

    alvo.alterar({ nome: 'Filtro de ar', qtdEstoque: 5, valorUn: 49.9 });

    expect(alvo.nome).toBe('Filtro de ar');
    expect(alvo.qtdEstoque).toBe(5);
    expect(alvo.valorUn).toBe(49.9);
  });

  it('ignora campos ausentes em alterar (alteração parcial)', () => {
    const alvo = Insumo.criar(props);

    alvo.alterar({ qtdEstoque: 3 });

    expect(alvo.qtdEstoque).toBe(3);
    expect(alvo.nome).toBe('Filtro de óleo');
  });

  it('move atualizadoEm mesmo sem alterações efetivas', () => {
    const alvo = Insumo.criar(props);
    const antes = alvo.atualizadoEm;

    jest.useFakeTimers().setSystemTime(antes.getTime() + 60_000);
    alvo.alterar({});
    jest.useRealTimers();

    expect(alvo.atualizadoEm.getTime()).toBeGreaterThan(antes.getTime());
  });

  it('aceita quantidade/valor zero (fronteira permitida)', () => {
    expect(() =>
      Insumo.criar({ ...props, qtdEstoque: 0, valorUn: 0 }),
    ).not.toThrow();
  });

  it('recusa nome vazio na criação', () => {
    expect(() => Insumo.criar({ ...props, ...{ nome: '' } })).toThrow(
      InsumoInvalidoException,
    );
  });

  it('recusa nome vazio na alteração', () => {
    const alvo = Insumo.criar(props);
    expect(() => alvo.alterar({ nome: '' })).toThrow(
      'O nome do insumo deve conter no mínimo 2 caracteres.',
    );
  });

  it('recusa nome com menos de 2 caracteres na criação', () => {
    expect(() => Insumo.criar({ ...props, ...{ nome: ' a ' } })).toThrow(
      InsumoInvalidoException,
    );
  });

  it('recusa nome com menos de 2 caracteres na alteração', () => {
    const alvo = Insumo.criar(props);
    expect(() => alvo.alterar({ nome: ' a ' })).toThrow(
      'O nome do insumo deve conter no mínimo 2 caracteres.',
    );
  });

  it('recusa quantidade negativa na criação', () => {
    expect(() => Insumo.criar({ ...props, ...{ qtdEstoque: -1 } })).toThrow(
      InsumoInvalidoException,
    );
  });

  it('recusa quantidade negativa na alteração', () => {
    const alvo = Insumo.criar(props);
    expect(() => alvo.alterar({ qtdEstoque: -1 })).toThrow(
      'A quantidade em estoque não pode ser negativa.',
    );
  });

  it('recusa valor negativo na criação', () => {
    expect(() => Insumo.criar({ ...props, ...{ valorUn: -0.01 } })).toThrow(
      InsumoInvalidoException,
    );
  });

  it('recusa valor negativo na alteração', () => {
    const alvo = Insumo.criar(props);
    expect(() => alvo.alterar({ valorUn: -0.01 })).toThrow(
      'O valor unitário não pode ser negativo.',
    );
  });

  it('softDelete carimba o instante informado', () => {
    const alvo = Insumo.criar(props);
    const agora = new Date('2025-05-05T10:00:00Z');

    alvo.softDelete(agora);

    expect(alvo.deletadoEm).toBe(agora);
    expect(alvo.atualizadoEm).toBe(agora);
  });

  it('softDelete usa o instante atual quando nenhum é informado', () => {
    const alvo = Insumo.criar(props);

    alvo.softDelete();

    expect(alvo.deletadoEm).toBeInstanceOf(Date);
    expect(alvo.deletadoEm).toEqual(alvo.atualizadoEm);
  });
});
