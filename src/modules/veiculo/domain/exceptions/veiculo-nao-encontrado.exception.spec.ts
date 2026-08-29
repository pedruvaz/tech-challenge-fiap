import { PlacaJaCadastradaException } from './placa-ja-cadastrada.exception';
import { VeiculoNaoEncontradoException } from './veiculo-nao-encontrado.exception';

describe('exceções de veículo', () => {
  it('VeiculoNaoEncontradoException carrega o id na mensagem', () => {
    const erro = new VeiculoNaoEncontradoException('veiculo-1');
    expect(erro.kind).toBe('NOT_FOUND');
    expect(erro.name).toBe('VeiculoNaoEncontradoException');
    expect(erro.message).toBe('Veículo com id veiculo-1 não encontrado');
  });

  it('PlacaJaCadastradaException é um conflito', () => {
    const erro = new PlacaJaCadastradaException();
    expect(erro.kind).toBe('CONFLICT');
    expect(erro.name).toBe('PlacaJaCadastradaException');
    expect(erro.message).toBe('Já existe um veículo com esta placa');
  });
});
