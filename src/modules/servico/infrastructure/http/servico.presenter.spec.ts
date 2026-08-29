import { Servico } from '../../domain/entities/servico.entity';
import { ServicoPresenter } from './servico.presenter';

const servicoPersistido = (servicoId = 42): Servico =>
  Servico.reconstituir({
    servicoId,
    descricao: 'Troca de óleo',
    valor: 120,
    criadoEm: new Date('2024-01-01T00:00:00Z'),
    atualizadoEm: new Date('2024-02-01T00:00:00Z'),
    deletadoEm: null,
  });

describe('ServicoPresenter', () => {
  it('monta o DTO a partir da entidade', () => {
    const dto = ServicoPresenter.apresentar(servicoPersistido());

    expect(dto).toMatchObject({
      servicoId: 42,
      descricao: 'Troca de óleo',
      valor: 120,
    });
    expect(dto.criadoEm).toBeInstanceOf(Date);
    expect(dto.atualizadoEm).toBeInstanceOf(Date);
  });

  it('recusa apresentar entidade sem id (invariante)', () => {
    const semId = Servico.criar({ descricao: 'Troca de óleo', valor: 120 });

    expect(() => ServicoPresenter.apresentar(semId)).toThrow(
      'invariante violada',
    );
  });

  it('apresenta listas preservando a ordem', () => {
    const dtos = ServicoPresenter.apresentarLista([
      servicoPersistido(42),
      servicoPersistido(43),
    ]);

    expect(dtos.map((d) => d.servicoId)).toEqual([42, 43]);
  });

  it('apresenta lista vazia', () => {
    expect(ServicoPresenter.apresentarLista([])).toEqual([]);
  });
});
