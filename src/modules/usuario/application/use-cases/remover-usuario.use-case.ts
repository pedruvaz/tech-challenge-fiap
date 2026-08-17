import { UsuarioNaoEncontradoException } from '../../domain/exceptions/usuario-nao-encontrado.exception';
import { UsuarioRepository } from '../../domain/repositories/usuario.repository';

export class RemoverUsuarioUseCase {
  constructor(private readonly repo: UsuarioRepository) {}

  async executar(idUsuario: number): Promise<void> {
    const usuario = await this.repo.buscarPorId(idUsuario);
    if (!usuario) throw new UsuarioNaoEncontradoException(idUsuario);

    usuario.softDelete();
    await this.repo.salvar(usuario);
  }
}
