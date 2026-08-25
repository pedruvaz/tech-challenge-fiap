import { Usuario } from '../entities/usuario.entity';

export abstract class UsuarioRepository {
  abstract salvar(usuario: Usuario): Promise<Usuario>;
  abstract buscarPorId(idUsuario: number): Promise<Usuario | null>;
  abstract buscarPorEmail(email: string): Promise<Usuario | null>;
  abstract listar(): Promise<Usuario[]>;
  abstract existeComEmail(
    email: string,
    ignorarIdUsuario?: number,
  ): Promise<boolean>;
}
