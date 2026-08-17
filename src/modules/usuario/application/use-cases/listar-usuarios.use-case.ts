import { Usuario } from '../../domain/entities/usuario.entity';
import { UsuarioRepository } from '../../domain/repositories/usuario.repository';

export class ListarUsuariosUseCase {
  constructor(private readonly repo: UsuarioRepository) {}

  executar(): Promise<Usuario[]> {
    return this.repo.listar();
  }
}
