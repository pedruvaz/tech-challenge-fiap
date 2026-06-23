import { ApiProperty } from '@nestjs/swagger';
import { Roles, Usuario } from '@prisma/client';

export class UsuarioResponseDto {
  @ApiProperty({ example: 1 })
  idUsuario: number;

  @ApiProperty({ example: 'João da Silva' })
  nome: string;

  @ApiProperty({ example: 'joao.silva@oficina.com' })
  email: string;

  @ApiProperty({ enum: Roles, example: Roles.funcionario })
  roles: Roles;

  @ApiProperty()
  criadoEm: Date;

  @ApiProperty()
  atualizadoEm: Date;

  constructor(usuario: Usuario) {
    this.idUsuario = usuario.idUsuario;
    this.nome = usuario.nome;
    this.email = usuario.email;
    this.roles = usuario.roles;
    this.criadoEm = usuario.criadoEm;
    this.atualizadoEm = usuario.atualizadoEm;
  }
}
