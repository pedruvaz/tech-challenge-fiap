import { Peca } from '../../domain/entities/peca.entity';
import { PecaPresenter } from './peca.presenter';

const pecaPersistido = (pecaId = 42): Peca =>
  Peca.reconstituir({
    pecaId,
    nome: 'Filtro de óleo',
    qtdEstoque: 10,
    valorUn: 39.9,
    criadoEm: new Date('2024-01-01T00:00:00Z'),
    atualizadoEm: new Date('2024-02-01T00:00:00Z'),
    deletadoEm: null,
  });

describe('PecaPresenter', () => {
  it('monta o DTO a partir da entidade', () => {
    const dto = PecaPresenter.apresentar(pecaPersistido());

    expect(dto).toMatchObject({
      pecaId: 42,
      nome: 'Filtro de óleo',
      qtdEstoque: 10,
      valorUn: 39.9,
    });
    expect(dto.criadoEm).toBeInstanceOf(Date);
    expect(dto.atualizadoEm).toBeInstanceOf(Date);
  });

  it('recusa apresentar entidade sem id (invariante)', () => {
    const semId = Peca.criar({
      nome: 'Filtro de óleo',
      qtdEstoque: 10,
      valorUn: 39.9,
    });

    expect(() => PecaPresenter.apresentar(semId)).toThrow('invariante violada');
  });

  it('apresenta listas preservando a ordem', () => {
    const dtos = PecaPresenter.apresentarLista([
      pecaPersistido(42),
      pecaPersistido(43),
    ]);

    expect(dtos.map((d) => d.pecaId)).toEqual([42, 43]);
  });

  it('apresenta lista vazia', () => {
    expect(PecaPresenter.apresentarLista([])).toEqual([]);
  });
});
