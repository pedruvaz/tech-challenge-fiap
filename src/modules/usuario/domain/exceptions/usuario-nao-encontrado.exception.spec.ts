import { EmailJaCadastradoException } from './email-ja-cadastrado.exception';
import { UsuarioNaoEncontradoException } from './usuario-nao-encontrado.exception';

describe('exceções de usuário', () => {
  it('UsuarioNaoEncontradoException carrega o id na mensagem', () => {
    const erro = new UsuarioNaoEncontradoException(7);
    expect(erro.kind).toBe('NOT_FOUND');
    expect(erro.name).toBe('UsuarioNaoEncontradoException');
    expect(erro.message).toBe('Usuário com id 7 não encontrado');
  });

  it('EmailJaCadastradoException é um conflito', () => {
    const erro = new EmailJaCadastradoException();
    expect(erro.kind).toBe('CONFLICT');
    expect(erro.name).toBe('EmailJaCadastradoException');
    expect(erro.message).toBe('Já existe um usuário com este email');
  });
});
