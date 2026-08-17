import * as bcrypt from 'bcrypt';
import { Roles } from '@prisma/client';
import { Usuario } from '../../domain/entities/usuario.entity';
import { EmailJaCadastradoException } from '../../domain/exceptions/email-ja-cadastrado.exception';
import { UsuarioRepository } from '../../domain/repositories/usuario.repository';
import { CriarUsuarioUseCase } from './criar-usuario.use-case';

class RepoFake implements UsuarioRepository {
  usuarios: Usuario[] = [];
  emailExiste = false;
  private nextId = 1;

  salvar = jest.fn((u: Usuario): Promise<Usuario> => {
    const reconstituido = Usuario.reconstituir({
      idUsuario: this.nextId++,
      nome: u.nome,
      email: u.email,
      senhaHash: u.senhaHash,
      roles: u.roles,
      criadoEm: u.criadoEm,
      atualizadoEm: u.atualizadoEm,
      deletadoEm: u.deletadoEm,
    });
    this.usuarios.push(reconstituido);
    return Promise.resolve(reconstituido);
  });
  buscarPorId = jest.fn(
    (id: number): Promise<Usuario | null> =>
      Promise.resolve(this.usuarios.find((u) => u.idUsuario === id) ?? null),
  );
  buscarPorEmail = jest.fn(
    (email: string): Promise<Usuario | null> =>
      Promise.resolve(this.usuarios.find((u) => u.email === email) ?? null),
  );
  listar = jest.fn((): Promise<Usuario[]> => Promise.resolve(this.usuarios));
  existeComEmail = jest.fn(
    (): Promise<boolean> => Promise.resolve(this.emailExiste),
  );
}

const input = {
  nome: 'João',
  email: 'joao@oficina.com',
  senha: 'segredo123',
};

describe('CriarUsuarioUseCase', () => {
  it('rejeita quando já existe usuário com o email', async () => {
    const repo = new RepoFake();
    repo.emailExiste = true;
    const uc = new CriarUsuarioUseCase(repo);
    await expect(uc.executar(input)).rejects.toBeInstanceOf(
      EmailJaCadastradoException,
    );
    expect(repo.salvar).not.toHaveBeenCalled();
  });

  it('hasheia a senha antes de persistir', async () => {
    const repo = new RepoFake();
    const uc = new CriarUsuarioUseCase(repo);
    const usuario = await uc.executar(input);
    expect(usuario.senhaHash).not.toBe(input.senha);
    expect(await bcrypt.compare(input.senha, usuario.senhaHash)).toBe(true);
  });

  it('assume role funcionario por padrão', async () => {
    const repo = new RepoFake();
    const uc = new CriarUsuarioUseCase(repo);
    const usuario = await uc.executar(input);
    expect(usuario.roles).toBe(Roles.funcionario);
  });
});
