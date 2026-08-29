import { Roles, Usuario as PrismaUsuario } from '@prisma/client';
import { reconstituirUsuario } from './usuario.mapper';

const raw = (over: Partial<PrismaUsuario> = {}): PrismaUsuario =>
  ({
    idUsuario: 7,
    nome: 'Ana',
    email: 'ana@oficina.com',
    senha: 'hash-do-banco',
    roles: Roles.admin,
    criadoEm: new Date('2024-01-01T00:00:00Z'),
    atualizadoEm: new Date('2024-02-01T00:00:00Z'),
    deletadoEm: null,
    ...over,
  }) as PrismaUsuario;

describe('reconstituirUsuario', () => {
  it('mapeia a coluna senha para senhaHash do domínio', () => {
    const usuario = reconstituirUsuario(raw());

    expect(usuario.idUsuario).toBe(7);
    expect(usuario.nome).toBe('Ana');
    expect(usuario.email).toBe('ana@oficina.com');
    expect(usuario.senhaHash).toBe('hash-do-banco');
    expect(usuario.roles).toBe(Roles.admin);
    expect(usuario.foiCriadoAgora).toBe(false);
  });

  it('propaga deletadoEm de registros com soft delete', () => {
    const deletadoEm = new Date('2024-03-01T00:00:00Z');

    expect(reconstituirUsuario(raw({ deletadoEm })).deletadoEm).toEqual(
      deletadoEm,
    );
  });
});
