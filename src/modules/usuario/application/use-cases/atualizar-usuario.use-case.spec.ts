import * as bcrypt from 'bcrypt';
import { Roles } from '@prisma/client';
import { Usuario } from '../../domain/entities/usuario.entity';
import { EmailJaCadastradoException } from '../../domain/exceptions/email-ja-cadastrado.exception';
import { UsuarioNaoEncontradoException } from '../../domain/exceptions/usuario-nao-encontrado.exception';
import { UsuarioRepository } from '../../domain/repositories/usuario.repository';
import { AtualizarUsuarioUseCase } from './atualizar-usuario.use-case';

jest.mock('bcrypt');
const hashMock = bcrypt.hash as unknown as jest.Mock;

const usuarioExistente = (): Usuario =>
  Usuario.reconstituir({
    idUsuario: 7,
    nome: 'Ana',
    email: 'ana@oficina.com',
    senhaHash: 'hash-antigo',
    roles: Roles.admin,
    criadoEm: new Date('2024-01-01T00:00:00Z'),
    atualizadoEm: new Date('2024-01-01T00:00:00Z'),
    deletadoEm: null,
  });

const criarRepo = (usuario: Usuario | null, conflito = false) =>
  ({
    salvar: jest.fn().mockImplementation((u: Usuario) => Promise.resolve(u)),
    buscarPorId: jest.fn().mockResolvedValue(usuario),
    buscarPorEmail: jest.fn(),
    listar: jest.fn(),
    existeComEmail: jest.fn().mockResolvedValue(conflito),
  }) as unknown as UsuarioRepository;

describe('AtualizarUsuarioUseCase', () => {
  beforeEach(() => {
    hashMock.mockReset();
    hashMock.mockResolvedValue('hash-novo');
  });

  it('lança UsuarioNaoEncontradoException quando o usuário não existe', async () => {
    const repo = criarRepo(null);

    await expect(
      new AtualizarUsuarioUseCase(repo).executar({ idUsuario: 99 }),
    ).rejects.toThrow(UsuarioNaoEncontradoException);
    expect(repo.salvar).not.toHaveBeenCalled();
  });

  it('rejeita quando o novo email já pertence a outro usuário', async () => {
    const repo = criarRepo(usuarioExistente(), true);

    await expect(
      new AtualizarUsuarioUseCase(repo).executar({
        idUsuario: 7,
        email: 'outro@oficina.com',
      }),
    ).rejects.toThrow(EmailJaCadastradoException);
    expect(repo.existeComEmail).toHaveBeenCalledWith('outro@oficina.com', 7);
    expect(repo.salvar).not.toHaveBeenCalled();
  });

  it('não checa unicidade quando o email não é alterado', async () => {
    const repo = criarRepo(usuarioExistente());

    await new AtualizarUsuarioUseCase(repo).executar({
      idUsuario: 7,
      nome: 'Ana Maria',
    });

    expect(repo.existeComEmail).not.toHaveBeenCalled();
  });

  it('faz o hash da nova senha antes de persistir', async () => {
    const usuario = usuarioExistente();
    const repo = criarRepo(usuario);

    await new AtualizarUsuarioUseCase(repo).executar({
      idUsuario: 7,
      senha: 'senha-em-claro',
    });

    expect(hashMock).toHaveBeenCalledWith('senha-em-claro', 10);
    expect(usuario.senhaHash).toBe('hash-novo');
  });

  it('não toca no hash quando a senha não é informada', async () => {
    const usuario = usuarioExistente();
    const repo = criarRepo(usuario);

    await new AtualizarUsuarioUseCase(repo).executar({
      idUsuario: 7,
      nome: 'Ana Maria',
    });

    expect(hashMock).not.toHaveBeenCalled();
    expect(usuario.senhaHash).toBe('hash-antigo');
  });

  it('aplica nome, email e roles e devolve o resultado do repositório', async () => {
    const usuario = usuarioExistente();
    const repo = criarRepo(usuario);

    const resultado = await new AtualizarUsuarioUseCase(repo).executar({
      idUsuario: 7,
      nome: 'Ana Maria',
      email: 'ana.maria@oficina.com',
      roles: Roles.mecanico,
    });

    expect(usuario.nome).toBe('Ana Maria');
    expect(usuario.email).toBe('ana.maria@oficina.com');
    expect(usuario.roles).toBe(Roles.mecanico);
    expect(resultado).toBe(usuario);
    expect(repo.salvar).toHaveBeenCalledWith(usuario);
  });
});
