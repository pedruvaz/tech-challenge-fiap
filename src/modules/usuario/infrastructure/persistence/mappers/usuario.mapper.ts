import { Usuario as PrismaUsuario } from '@prisma/client';
import { Usuario } from '../../../domain/entities/usuario.entity';

export function reconstituirUsuario(raw: PrismaUsuario): Usuario {
  return Usuario.reconstituir({
    idUsuario: raw.idUsuario,
    nome: raw.nome,
    email: raw.email,
    senhaHash: raw.senha,
    roles: raw.roles,
    criadoEm: raw.criadoEm,
    atualizadoEm: raw.atualizadoEm,
    deletadoEm: raw.deletadoEm,
  });
}
