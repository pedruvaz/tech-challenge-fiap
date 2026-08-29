import { Roles } from '@prisma/client';
import { Usuario } from '../../domain/entities/usuario.entity';
import { UsuarioNaoEncontradoException } from '../../domain/exceptions/usuario-nao-encontrado.exception';
import { UsuarioRepository } from '../../domain/repositories/usuario.repository';
import { RemoverUsuarioUseCase } from './remover-usuario.use-case';

const repoCom = (usuario: Usuario | null): UsuarioRepository => ({
  salvar: jest.fn().mockResolvedValue(usuario),
  buscarPorId: jest.fn().mockResolvedValue(usuario),
  buscarPorEmail: jest.fn(),
  listar: jest.fn(),
  existeComEmail: jest.fn(),
});

const usuarioExistente = (): Usuario =>
  Usuario.reconstituir({
    idUsuario: 7,
    nome: 'Ana',
    email: 'ana@oficina.com',
    senhaHash: 'h',
    roles: Roles.admin,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    deletadoEm: null,
  });

describe('RemoverUsuarioUseCase', () => {
  it('faz soft delete e persiste', async () => {
    const usuario = usuarioExistente();
    const repo = repoCom(usuario);

    await new RemoverUsuarioUseCase(repo).executar(7);

    expect(usuario.deletadoEm).toBeInstanceOf(Date);
    expect(repo.salvar).toHaveBeenCalledWith(usuario);
  });

  it('lança UsuarioNaoEncontradoException e não salva', async () => {
    const repo = repoCom(null);

    await expect(new RemoverUsuarioUseCase(repo).executar(99)).rejects.toThrow(
      UsuarioNaoEncontradoException,
    );
    expect(repo.salvar).not.toHaveBeenCalled();
  });
});
