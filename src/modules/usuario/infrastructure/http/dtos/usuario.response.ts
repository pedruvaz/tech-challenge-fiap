import { ApiProperty } from '@nestjs/swagger';
import { Roles } from '@prisma/client';

export class UsuarioResponseDto {
  @ApiProperty({ example: 1 })
  idUsuario: number;

  @ApiProperty({ example: 'João da Silva' })
  nome: string;

  @ApiProperty({ example: 'joao.silva@oficina.com' })
  email: string;

  @ApiProperty({ enum: Roles, example: Roles.funcionario })
  roles: Roles;

  @ApiProperty() criadoEm: Date;
  @ApiProperty() atualizadoEm: Date;
}
