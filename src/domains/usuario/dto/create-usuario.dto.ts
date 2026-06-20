import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'joao.silva@oficina.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senhaSegura123', minLength: 6 })
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiPropertyOptional({ enum: Roles, default: Roles.funcionario })
  @IsOptional()
  @IsEnum(Roles)
  roles?: Roles;
}
