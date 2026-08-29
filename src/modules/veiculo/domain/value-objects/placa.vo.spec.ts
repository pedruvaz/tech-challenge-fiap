import { PlacaInvalidaException } from '../exceptions/placa-invalida.exception';
import { Placa } from './placa.vo';

describe('Placa (VO)', () => {
  it.each(['ABC1234', 'ABC-1234', 'abc1234', 'ABC 1234'])(
    'aceita o formato antigo %s',
    (valor) => {
      expect(Placa.criar(valor).valor).toBe(valor);
    },
  );

  it.each(['ABC1D23', 'abc1d23'])('aceita o formato Mercosul %s', (valor) => {
    expect(Placa.criar(valor).valor).toBe(valor);
  });

  it.each(['', 'AB1234', 'ABCD123', 'ABC12345', '1234ABC', 'ABC1DD3'])(
    'rejeita a placa inválida "%s"',
    (valor) => {
      expect(() => Placa.criar(valor)).toThrow(PlacaInvalidaException);
    },
  );

  it('expõe kind INVALID_INPUT e mensagem de formato na exceção', () => {
    const erro = new PlacaInvalidaException();
    expect(erro.kind).toBe('INVALID_INPUT');
    expect(erro.name).toBe('PlacaInvalidaException');
    expect(erro.message).toContain('Mercosul');
  });

  it('reconstitui sem validar (dado que já está persistido)', () => {
    expect(Placa.reconstituir('placa-legada-invalida').valor).toBe(
      'placa-legada-invalida',
    );
  });
});
