import { Usuario } from '../../domain/entities/usuario.entity';
import { UsuarioNaoEncontradoException } from '../../domain/exceptions/usuario-nao-encontrado.exception';
import { UsuarioRepository } from '../../domain/repositories/usuario.repository';

export class BuscarUsuarioPorIdUseCase {
  constructor(private readonly repo: UsuarioRepository) {}

  async executar(idUsuario: number): Promise<Usuario> {
    const usuario = await this.repo.buscarPorId(idUsuario);
    if (!usuario) throw new UsuarioNaoEncontradoException(idUsuario);
    return usuario;
  }
}
