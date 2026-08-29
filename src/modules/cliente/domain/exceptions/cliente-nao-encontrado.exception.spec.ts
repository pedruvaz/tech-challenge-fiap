import { ClienteNaoEncontradoException } from './cliente-nao-encontrado.exception';
import { DocumentoInvalidoException } from './documento-invalido.exception';
import { DocumentoJaCadastradoException } from './documento-ja-cadastrado.exception';

describe('exceções de cliente', () => {
  it('ClienteNaoEncontradoException carrega o id na mensagem', () => {
    const erro = new ClienteNaoEncontradoException('c1');
    expect(erro.kind).toBe('NOT_FOUND');
    expect(erro.name).toBe('ClienteNaoEncontradoException');
    expect(erro.message).toBe('Cliente com id c1 não encontrado');
  });

  it('DocumentoJaCadastradoException é um conflito', () => {
    const erro = new DocumentoJaCadastradoException();
    expect(erro.kind).toBe('CONFLICT');
    expect(erro.message).toBe(
      'Já existe um cliente com este número de documento',
    );
  });

  describe('DocumentoInvalidoException', () => {
    it('fala em CPF para pessoa física', () => {
      const erro = new DocumentoInvalidoException('pessoa_fisica');
      expect(erro.kind).toBe('INVALID_INPUT');
      expect(erro.message).toBe('CPF inválido');
    });

    it('fala em CNPJ para pessoa jurídica', () => {
      expect(new DocumentoInvalidoException('pessoa_juridica').message).toBe(
        'CNPJ inválido',
      );
    });

    it('cai na mensagem genérica para tipo desconhecido', () => {
      const erro = new DocumentoInvalidoException(
        'outro' as unknown as 'pessoa_fisica',
      );
      expect(erro.message).toBe('CPF ou CNPJ inválido');
    });
  });
});
