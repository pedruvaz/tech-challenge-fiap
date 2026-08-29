import { Veiculo as VeiculoPrisma } from '@prisma/client';
import { reconstituirVeiculo } from './veiculo.mapper';

const raw = (over: Partial<VeiculoPrisma> = {}): VeiculoPrisma => ({
  veiculoId: 'v1',
  placa: 'ABC1D23',
  marca: 'Toyota',
  modelo: 'Corolla',
  ano: '2020',
  cor: 'Preto',
  criadoEm: new Date('2024-01-01T00:00:00Z'),
  atualizadoEm: new Date('2024-02-01T00:00:00Z'),
  deletadoEm: null,
  ...over,
});

describe('reconstituirVeiculo', () => {
  it('mapeia a linha do Prisma para a entidade de domínio', () => {
    const veiculo = reconstituirVeiculo(raw());

    expect(veiculo.veiculoId).toBe('v1');
    expect(veiculo.placa.valor).toBe('ABC1D23');
    expect(veiculo.marca).toBe('Toyota');
    expect(veiculo.modelo).toBe('Corolla');
    expect(veiculo.ano).toBe('2020');
    expect(veiculo.cor).toBe('Preto');
    expect(veiculo.criadoEm).toEqual(new Date('2024-01-01T00:00:00Z'));
    expect(veiculo.atualizadoEm).toEqual(new Date('2024-02-01T00:00:00Z'));
    expect(veiculo.deletadoEm).toBeNull();
    expect(veiculo.foiCriadoAgora).toBe(false);
  });

  it('propaga deletadoEm de registros com soft delete', () => {
    const deletadoEm = new Date('2024-03-01T00:00:00Z');

    expect(reconstituirVeiculo(raw({ deletadoEm })).deletadoEm).toEqual(
      deletadoEm,
    );
  });

  it('reconstitui placas legadas sem revalidar o formato', () => {
    expect(
      reconstituirVeiculo(raw({ placa: 'FORA-DO-PADRAO' })).placa.valor,
    ).toBe('FORA-DO-PADRAO');
  });
});
