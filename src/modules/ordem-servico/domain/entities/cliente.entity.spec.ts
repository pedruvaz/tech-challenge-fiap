import { Cliente } from './cliente.entity';

describe('Cliente — documento', () => {
  const cli = new Cliente('c1', 'João', '123.456.789-00');

  it('confere ignorando máscara', () => {
    expect(cli.documentoConfereCom('12345678900')).toBe(true);
    expect(cli.documentoConfereCom('123.456.789-00')).toBe(true);
  });

  it('recusa documento diferente', () => {
    expect(cli.documentoConfereCom('99999999999')).toBe(false);
  });
});
