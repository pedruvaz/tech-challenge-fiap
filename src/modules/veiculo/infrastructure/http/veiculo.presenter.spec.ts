import { Veiculo } from '../../domain/entities/veiculo.entity';
import { VeiculoPresenter } from './veiculo.presenter';

const veiculo = (id = 'v1', placa = 'ABC1D23'): Veiculo =>
  Veiculo.criar({
    veiculoId: id,
    placa,
    marca: 'Toyota',
    modelo: 'Corolla',
    ano: '2020',
    cor: 'Preto',
    clienteProprietarioId: 'c1',
  });

describe('VeiculoPresenter', () => {
  it('achata o VO de placa em string no DTO', () => {
    const dto = VeiculoPresenter.apresentar(veiculo());

    expect(dto).toMatchObject({
      veiculoId: 'v1',
      placa: 'ABC1D23',
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: '2020',
      cor: 'Preto',
    });
    expect(dto.criadoEm).toBeInstanceOf(Date);
    expect(dto.atualizadoEm).toBeInstanceOf(Date);
  });

  it('não vaza campos internos do domínio', () => {
    const dto = VeiculoPresenter.apresentar(veiculo());

    expect(Object.keys(dto).sort()).toEqual([
      'ano',
      'atualizadoEm',
      'cor',
      'criadoEm',
      'marca',
      'modelo',
      'placa',
      'veiculoId',
    ]);
  });

  it('apresenta listas preservando a ordem', () => {
    const dtos = VeiculoPresenter.apresentarLista([
      veiculo('v1', 'ABC1D23'),
      veiculo('v2', 'XYZ4321'),
    ]);

    expect(dtos.map((d) => d.veiculoId)).toEqual(['v1', 'v2']);
    expect(dtos.map((d) => d.placa)).toEqual(['ABC1D23', 'XYZ4321']);
  });

  it('apresenta lista vazia', () => {
    expect(VeiculoPresenter.apresentarLista([])).toEqual([]);
  });
});
