import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Usuario } from '../../domain/entities/usuario.entity';
import { UsuarioRepository } from '../../domain/repositories/usuario.repository';
import { reconstituirUsuario } from './mappers/usuario.mapper';

@Injectable()
export class PrismaUsuarioRepository extends UsuarioRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async buscarPorId(idUsuario: number): Promise<Usuario | null> {
    const raw = await this.prisma.usuario.findFirst({
      where: { idUsuario, deletadoEm: null },
    });
    return raw ? reconstituirUsuario(raw) : null;
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const raw = await this.prisma.usuario.findFirst({
      where: { email, deletadoEm: null },
    });
    return raw ? reconstituirUsuario(raw) : null;
  }

  async listar(): Promise<Usuario[]> {
    const rows = await this.prisma.usuario.findMany({
      where: { deletadoEm: null },
      orderBy: { idUsuario: 'asc' },
    });
    return rows.map(reconstituirUsuario);
  }

  async existeComEmail(
    email: string,
    ignorarIdUsuario?: number,
  ): Promise<boolean> {
    const existente = await this.prisma.usuario.findFirst({
      where: { email, deletadoEm: null },
      select: { idUsuario: true },
    });
    if (!existente) return false;
    if (ignorarIdUsuario && existente.idUsuario === ignorarIdUsuario)
      return false;
    return true;
  }

  async salvar(usuario: Usuario): Promise<Usuario> {
    const dados = {
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senhaHash,
      roles: usuario.roles,
      deletadoEm: usuario.deletadoEm,
    };

    if (usuario.foiCriadoAgora) {
      const criado = await this.prisma.usuario.create({ data: dados });
      return reconstituirUsuario(criado);
    }

    if (usuario.idUsuario === null) {
      throw new Error(
        'Usuário reconstituído sem idUsuario — invariante violada',
      );
    }

    const atualizado = await this.prisma.usuario.update({
      where: { idUsuario: usuario.idUsuario },
      data: dados,
    });
    return reconstituirUsuario(atualizado);
  }
}
