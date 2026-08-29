import { VeiculoVinculado } from './veiculo-vinculado.entity';

describe('VeiculoVinculado (read model)', () => {
  it('expõe os campos do veículo vinculado como somente leitura', () => {
    const criadoEm = new Date('2024-01-01T00:00:00Z');
    const atualizadoEm = new Date('2024-02-01T00:00:00Z');

    const vinculado = new VeiculoVinculado(
      'v1',
      'ABC1D23',
      'Toyota',
      'Corolla',
      '2020',
      'Preto',
      criadoEm,
      atualizadoEm,
      null,
    );

    expect(vinculado.veiculoId).toBe('v1');
    expect(vinculado.placa).toBe('ABC1D23');
    expect(vinculado.marca).toBe('Toyota');
    expect(vinculado.modelo).toBe('Corolla');
    expect(vinculado.ano).toBe('2020');
    expect(vinculado.cor).toBe('Preto');
    expect(vinculado.criadoEm).toBe(criadoEm);
    expect(vinculado.atualizadoEm).toBe(atualizadoEm);
    expect(vinculado.deletadoEm).toBeNull();
  });

  it('carrega deletadoEm quando o veículo foi removido', () => {
    const deletadoEm = new Date('2024-03-01T00:00:00Z');

    const vinculado = new VeiculoVinculado(
      'v1',
      'ABC1D23',
      'Toyota',
      'Corolla',
      '2020',
      'Preto',
      new Date(),
      new Date(),
      deletadoEm,
    );

    expect(vinculado.deletadoEm).toBe(deletadoEm);
  });
});
