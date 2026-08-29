import { Insumo } from '../../domain/entities/insumo.entity';
import { InsumoPresenter } from './insumo.presenter';

const insumoPersistido = (insumoId = 42): Insumo =>
  Insumo.reconstituir({
    insumoId,
    nome: 'Filtro de óleo',
    qtdEstoque: 10,
    valorUn: 39.9,
    criadoEm: new Date('2024-01-01T00:00:00Z'),
    atualizadoEm: new Date('2024-02-01T00:00:00Z'),
    deletadoEm: null,
  });

describe('InsumoPresenter', () => {
  it('monta o DTO a partir da entidade', () => {
    const dto = InsumoPresenter.apresentar(insumoPersistido());

    expect(dto).toMatchObject({
      insumoId: 42,
      nome: 'Filtro de óleo',
      qtdEstoque: 10,
      valorUn: 39.9,
    });
    expect(dto.criadoEm).toBeInstanceOf(Date);
    expect(dto.atualizadoEm).toBeInstanceOf(Date);
  });

  it('recusa apresentar entidade sem id (invariante)', () => {
    const semId = Insumo.criar({
      nome: 'Filtro de óleo',
      qtdEstoque: 10,
      valorUn: 39.9,
    });

    expect(() => InsumoPresenter.apresentar(semId)).toThrow(
      'invariante violada',
    );
  });

  it('apresenta listas preservando a ordem', () => {
    const dtos = InsumoPresenter.apresentarLista([
      insumoPersistido(42),
      insumoPersistido(43),
    ]);

    expect(dtos.map((d) => d.insumoId)).toEqual([42, 43]);
  });

  it('apresenta lista vazia', () => {
    expect(InsumoPresenter.apresentarLista([])).toEqual([]);
  });
});
