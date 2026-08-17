import { Usuario } from '../../domain/entities/usuario.entity';
import { UsuarioResponseDto } from './dtos/usuario.response';

export class UsuarioPresenter {
  static apresentar(usuario: Usuario): UsuarioResponseDto {
    if (usuario.idUsuario === null) {
      throw new Error(
        'UsuarioPresenter recebeu usuário sem id — invariante violada',
      );
    }
    const dto = new UsuarioResponseDto();
    dto.idUsuario = usuario.idUsuario;
    dto.nome = usuario.nome;
    dto.email = usuario.email;
    dto.roles = usuario.roles;
    dto.criadoEm = usuario.criadoEm;
    dto.atualizadoEm = usuario.atualizadoEm;
    return dto;
  }

  static apresentarLista(usuarios: Usuario[]): UsuarioResponseDto[] {
    return usuarios.map((u) => UsuarioPresenter.apresentar(u));
  }
}
