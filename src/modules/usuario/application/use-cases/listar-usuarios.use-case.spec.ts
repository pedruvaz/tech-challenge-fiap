import { Roles } from '@prisma/client';
import { Usuario } from '../../domain/entities/usuario.entity';
import { UsuarioRepository } from '../../domain/repositories/usuario.repository';
import { ListarUsuariosUseCase } from './listar-usuarios.use-case';

describe('ListarUsuariosUseCase', () => {
  const repoQueLista = (usuarios: Usuario[]): UsuarioRepository => ({
    salvar: jest.fn(),
    buscarPorId: jest.fn(),
    buscarPorEmail: jest.fn(),
    listar: jest.fn().mockResolvedValue(usuarios),
    existeComEmail: jest.fn(),
  });

  it('delega a listagem ao repositório', async () => {
    const usuarios = [
      Usuario.criar({
        nome: 'Ana',
        email: 'ana@oficina.com',
        senhaHash: 'h',
        roles: Roles.admin,
      }),
    ];
    const repo = repoQueLista(usuarios);

    await expect(new ListarUsuariosUseCase(repo).executar()).resolves.toBe(
      usuarios,
    );
    expect(repo.listar).toHaveBeenCalledTimes(1);
  });

  it('devolve lista vazia quando não há usuários', async () => {
    await expect(
      new ListarUsuariosUseCase(repoQueLista([])).executar(),
    ).resolves.toEqual([]);
  });
});
