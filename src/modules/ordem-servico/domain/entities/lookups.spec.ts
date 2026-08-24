import { Dinheiro } from '../value-objects/dinheiro.vo';
import { Mecanico } from './mecanico.entity';
import { Servico } from './servico.entity';
import { Veiculo } from './veiculo.entity';

describe('Entidades de lookup (read-only)', () => {
  it('Servico expõe valor como Dinheiro', () => {
    const s = new Servico(1, 'Alinhamento', Dinheiro.deNumero(80));
    expect(s.descricao).toBe('Alinhamento');
    expect(s.valor.paraNumero()).toBe(80);
  });

  it('Veiculo é imutável e expõe placa/marca/modelo', () => {
    const v = new Veiculo('v1', 'ABC-1234', 'Ford', 'Ka');
    expect(v).toMatchObject({
      veiculoId: 'v1',
      placa: 'ABC-1234',
      marca: 'Ford',
      modelo: 'Ka',
    });
  });

  it('Mecanico expõe idUsuario e nome', () => {
    const m = new Mecanico(7, 'Ana');
    expect(m.idUsuario).toBe(7);
    expect(m.nome).toBe('Ana');
  });
});
