import { Roles } from '@prisma/client';
import { Usuario } from '../../domain/entities/usuario.entity';
import { UsuarioNaoEncontradoException } from '../../domain/exceptions/usuario-nao-encontrado.exception';
import { UsuarioRepository } from '../../domain/repositories/usuario.repository';
import { BuscarUsuarioPorIdUseCase } from './buscar-usuario-por-id.use-case';

const repoCom = (usuario: Usuario | null): UsuarioRepository => ({
  salvar: jest.fn(),
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

describe('BuscarUsuarioPorIdUseCase', () => {
  it('devolve o usuário encontrado', async () => {
    const usuario = usuarioExistente();
    const repo = repoCom(usuario);

    await expect(new BuscarUsuarioPorIdUseCase(repo).executar(7)).resolves.toBe(
      usuario,
    );
    expect(repo.buscarPorId).toHaveBeenCalledWith(7);
  });

  it('lança UsuarioNaoEncontradoException quando não existe', async () => {
    await expect(
      new BuscarUsuarioPorIdUseCase(repoCom(null)).executar(99),
    ).rejects.toThrow(UsuarioNaoEncontradoException);
  });
});
