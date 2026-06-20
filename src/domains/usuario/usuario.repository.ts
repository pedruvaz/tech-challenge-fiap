import { Injectable } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateUsuarioDto): Promise<Usuario> {
    return this.prisma.usuario.create({ data });
  }

  findAll(): Promise<Usuario[]> {
    return this.prisma.usuario.findMany({
      where: { deletadoEm: null },
      orderBy: { idUsuario: 'asc' },
    });
  }

  findById(idUsuario: number): Promise<Usuario | null> {
    return this.prisma.usuario.findFirst({
      where: { idUsuario, deletadoEm: null },
    });
  }

  findByEmail(email: string): Promise<Usuario | null> {
    return this.prisma.usuario.findFirst({
      where: { email, deletadoEm: null },
    });
  }

  update(idUsuario: number, data: UpdateUsuarioDto): Promise<Usuario> {
    return this.prisma.usuario.update({
      where: { idUsuario },
      data,
    });
  }

  softDelete(idUsuario: number): Promise<Usuario> {
    return this.prisma.usuario.update({
      where: { idUsuario },
      data: { deletadoEm: new Date() },
    });
  }
}
