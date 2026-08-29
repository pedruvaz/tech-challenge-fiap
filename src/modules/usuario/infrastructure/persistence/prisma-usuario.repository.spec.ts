import { Roles } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Usuario } from '../../domain/entities/usuario.entity';
import { PrismaUsuarioRepository } from './prisma-usuario.repository';

const linha = (over: Record<string, unknown> = {}) => ({
  idUsuario: 7,
  nome: 'Ana',
  email: 'ana@oficina.com',
  senha: 'hash-do-banco',
  roles: Roles.admin,
  criadoEm: new Date('2024-01-01T00:00:00Z'),
  atualizadoEm: new Date('2024-02-01T00:00:00Z'),
  deletadoEm: null,
  ...over,
});

function montar() {
  const usuario = {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const prisma = { usuario };

  return {
    repo: new PrismaUsuarioRepository(prisma as unknown as PrismaService),
    usuario,
  };
}

const persistido = (): Usuario =>
  Usuario.reconstituir({
    idUsuario: 7,
    nome: 'Ana',
    email: 'ana@oficina.com',
    senhaHash: 'hash-do-banco',
    roles: Roles.admin,
    criadoEm: new Date('2024-01-01T00:00:00Z'),
    atualizadoEm: new Date('2024-02-01T00:00:00Z'),
    deletadoEm: null,
  });

describe('PrismaUsuarioRepository', () => {
  describe('buscarPorId', () => {
    it('filtra por deletadoEm null e reconstitui', async () => {
      const { repo, usuario } = montar();
      usuario.findFirst.mockResolvedValue(linha());

      const encontrado = await repo.buscarPorId(7);

      expect(usuario.findFirst).toHaveBeenCalledWith({
        where: { idUsuario: 7, deletadoEm: null },
      });
      expect(encontrado?.idUsuario).toBe(7);
      expect(encontrado?.senhaHash).toBe('hash-do-banco');
    });

    it('devolve null quando não encontra', async () => {
      const { repo, usuario } = montar();
      usuario.findFirst.mockResolvedValue(null);

      await expect(repo.buscarPorId(99)).resolves.toBeNull();
    });
  });

  describe('buscarPorEmail', () => {
    it('filtra por email e deletadoEm null', async () => {
      const { repo, usuario } = montar();
      usuario.findFirst.mockResolvedValue(linha());

      const encontrado = await repo.buscarPorEmail('ana@oficina.com');

      expect(usuario.findFirst).toHaveBeenCalledWith({
        where: { email: 'ana@oficina.com', deletadoEm: null },
      });
      expect(encontrado?.email).toBe('ana@oficina.com');
    });

    it('devolve null quando não encontra', async () => {
      const { repo, usuario } = montar();
      usuario.findFirst.mockResolvedValue(null);

      await expect(
        repo.buscarPorEmail('sumiu@oficina.com'),
      ).resolves.toBeNull();
    });
  });

  describe('listar', () => {
    it('devolve apenas os não deletados, ordenados por id', async () => {
      const { repo, usuario } = montar();
      usuario.findMany.mockResolvedValue([
        linha(),
        linha({ idUsuario: 8, nome: 'Bruno' }),
      ]);

      const usuarios = await repo.listar();

      expect(usuario.findMany).toHaveBeenCalledWith({
        where: { deletadoEm: null },
        orderBy: { idUsuario: 'asc' },
      });
      expect(usuarios.map((u) => u.idUsuario)).toEqual([7, 8]);
    });

    it('devolve lista vazia quando não há linhas', async () => {
      const { repo, usuario } = montar();
      usuario.findMany.mockResolvedValue([]);

      await expect(repo.listar()).resolves.toEqual([]);
    });
  });

  describe('existeComEmail', () => {
    it('é falso quando ninguém usa o email', async () => {
      const { repo, usuario } = montar();
      usuario.findFirst.mockResolvedValue(null);

      await expect(repo.existeComEmail('ana@oficina.com')).resolves.toBe(false);
    });

    it('é verdadeiro quando outro usuário usa o email', async () => {
      const { repo, usuario } = montar();
      usuario.findFirst.mockResolvedValue({ idUsuario: 99 });

      await expect(repo.existeComEmail('ana@oficina.com')).resolves.toBe(true);
    });

    it('ignora o próprio usuário na checagem', async () => {
      const { repo, usuario } = montar();
      usuario.findFirst.mockResolvedValue({ idUsuario: 7 });

      await expect(repo.existeComEmail('ana@oficina.com', 7)).resolves.toBe(
        false,
      );
    });

    it('continua sendo conflito quando o id a ignorar é outro', async () => {
      const { repo, usuario } = montar();
      usuario.findFirst.mockResolvedValue({ idUsuario: 99 });

      await expect(repo.existeComEmail('ana@oficina.com', 7)).resolves.toBe(
        true,
      );
    });
  });

  describe('salvar', () => {
    it('cria e devolve a entidade com o id atribuído pelo banco', async () => {
      const { repo, usuario } = montar();
      usuario.create.mockResolvedValue(linha({ idUsuario: 42 }));
      const novo = Usuario.criar({
        nome: 'Ana',
        email: 'ana@oficina.com',
        senhaHash: 'hash-do-banco',
        roles: Roles.admin,
      });

      const salvo = await repo.salvar(novo);

      expect(usuario.create).toHaveBeenCalledWith({
        data: {
          nome: 'Ana',
          email: 'ana@oficina.com',
          senha: 'hash-do-banco',
          roles: Roles.admin,
          deletadoEm: null,
        },
      });
      expect(salvo.idUsuario).toBe(42);
    });

    it('atualiza pelo id quando o usuário já existia', async () => {
      const { repo, usuario } = montar();
      usuario.update.mockResolvedValue(linha({ nome: 'Ana Maria' }));

      const salvo = await repo.salvar(persistido());

      expect(usuario.update).toHaveBeenCalledWith({
        where: { idUsuario: 7 },
        data: expect.objectContaining({ email: 'ana@oficina.com' }) as unknown,
      });
      expect(salvo.nome).toBe('Ana Maria');
    });

    it('recusa atualizar entidade reconstituída sem id (invariante)', async () => {
      const { repo, usuario } = montar();
      const semId = Usuario.reconstituir({
        idUsuario: null as unknown as number,
        nome: 'Ana',
        email: 'ana@oficina.com',
        senhaHash: 'h',
        roles: Roles.admin,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        deletadoEm: null,
      });

      await expect(repo.salvar(semId)).rejects.toThrow('invariante violada');
      expect(usuario.update).not.toHaveBeenCalled();
    });
  });
});
