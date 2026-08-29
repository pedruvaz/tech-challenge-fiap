import { PlacaInvalidaException } from '../exceptions/placa-invalida.exception';
import { Placa } from '../value-objects/placa.vo';
import { Veiculo } from './veiculo.entity';

const props = {
  veiculoId: 'veiculo-1',
  placa: 'ABC1D23',
  marca: 'Toyota',
  modelo: 'Corolla',
  ano: '2020',
  cor: 'Preto',
  clienteProprietarioId: 'cliente-1',
};

describe('Veiculo (entidade)', () => {
  describe('criar', () => {
    it('monta o veículo marcado como recém-criado e sem deleção', () => {
      const veiculo = Veiculo.criar(props);

      expect(veiculo.veiculoId).toBe('veiculo-1');
      expect(veiculo.placa.valor).toBe('ABC1D23');
      expect(veiculo.marca).toBe('Toyota');
      expect(veiculo.modelo).toBe('Corolla');
      expect(veiculo.ano).toBe('2020');
      expect(veiculo.cor).toBe('Preto');
      expect(veiculo.foiCriadoAgora).toBe(true);
      expect(veiculo.deletadoEm).toBeNull();
      expect(veiculo.clienteProprietarioId).toBe('cliente-1');
      expect(veiculo.criadoEm).toEqual(veiculo.atualizadoEm);
    });

    it('valida a placa na criação', () => {
      expect(() => Veiculo.criar({ ...props, placa: 'XX' })).toThrow(
        PlacaInvalidaException,
      );
    });
  });

  describe('reconstituir', () => {
    it('preserva os timestamps e não marca como recém-criado', () => {
      const criadoEm = new Date('2024-01-01T00:00:00Z');
      const atualizadoEm = new Date('2024-02-01T00:00:00Z');
      const deletadoEm = new Date('2024-03-01T00:00:00Z');

      const veiculo = Veiculo.reconstituir({
        veiculoId: 'veiculo-2',
        placa: Placa.reconstituir('ABC1234'),
        marca: 'Fiat',
        modelo: 'Uno',
        ano: '2010',
        cor: 'Branco',
        criadoEm,
        atualizadoEm,
        deletadoEm,
      });

      expect(veiculo.criadoEm).toBe(criadoEm);
      expect(veiculo.atualizadoEm).toBe(atualizadoEm);
      expect(veiculo.deletadoEm).toBe(deletadoEm);
      expect(veiculo.foiCriadoAgora).toBe(false);
      // O vínculo de proprietário só existe no fluxo de criação.
      expect(veiculo.clienteProprietarioId).toBeNull();
    });
  });

  describe('alterar', () => {
    it('aplica todos os campos informados e move atualizadoEm', () => {
      const veiculo = Veiculo.criar(props);
      const antes = veiculo.atualizadoEm;

      jest.useFakeTimers().setSystemTime(antes.getTime() + 60_000);
      veiculo.alterar({
        placa: 'XYZ4321',
        marca: 'Honda',
        modelo: 'Civic',
        ano: '2022',
        cor: 'Prata',
      });
      jest.useRealTimers();

      expect(veiculo.placa.valor).toBe('XYZ4321');
      expect(veiculo.marca).toBe('Honda');
      expect(veiculo.modelo).toBe('Civic');
      expect(veiculo.ano).toBe('2022');
      expect(veiculo.cor).toBe('Prata');
      expect(veiculo.atualizadoEm.getTime()).toBeGreaterThan(antes.getTime());
    });

    it('ignora os campos ausentes (alteração parcial)', () => {
      const veiculo = Veiculo.criar(props);

      veiculo.alterar({ cor: 'Vermelho' });

      expect(veiculo.cor).toBe('Vermelho');
      expect(veiculo.placa.valor).toBe('ABC1D23');
      expect(veiculo.marca).toBe('Toyota');
      expect(veiculo.modelo).toBe('Corolla');
      expect(veiculo.ano).toBe('2020');
    });

    it('não altera nada quando o objeto de alterações está vazio', () => {
      const veiculo = Veiculo.criar(props);

      veiculo.alterar({});

      expect(veiculo.placa.valor).toBe('ABC1D23');
      expect(veiculo.marca).toBe('Toyota');
      expect(veiculo.cor).toBe('Preto');
    });

    it('revalida a placa quando ela é alterada', () => {
      const veiculo = Veiculo.criar(props);

      expect(() => veiculo.alterar({ placa: 'invalida' })).toThrow(
        PlacaInvalidaException,
      );
      expect(veiculo.placa.valor).toBe('ABC1D23');
    });
  });

  describe('softDelete', () => {
    it('carimba deletadoEm e atualizadoEm com o instante informado', () => {
      const veiculo = Veiculo.criar(props);
      const agora = new Date('2025-05-05T10:00:00Z');

      veiculo.softDelete(agora);

      expect(veiculo.deletadoEm).toBe(agora);
      expect(veiculo.atualizadoEm).toBe(agora);
    });

    it('usa o instante atual quando nenhum é informado', () => {
      const veiculo = Veiculo.criar(props);

      veiculo.softDelete();

      expect(veiculo.deletadoEm).toBeInstanceOf(Date);
      expect(veiculo.deletadoEm).toEqual(veiculo.atualizadoEm);
    });
  });
});
