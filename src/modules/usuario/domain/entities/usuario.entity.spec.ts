import { Roles } from '@prisma/client';
import { Usuario } from './usuario.entity';

const props = {
  nome: 'Ana',
  email: 'ana@oficina.com',
  senhaHash: 'hash-1',
  roles: Roles.admin,
};

describe('Usuario (entidade)', () => {
  describe('criar', () => {
    it('nasce sem id (o banco atribui) e marcado como recém-criado', () => {
      const usuario = Usuario.criar(props);

      expect(usuario.idUsuario).toBeNull();
      expect(usuario.nome).toBe('Ana');
      expect(usuario.email).toBe('ana@oficina.com');
      expect(usuario.senhaHash).toBe('hash-1');
      expect(usuario.roles).toBe(Roles.admin);
      expect(usuario.foiCriadoAgora).toBe(true);
      expect(usuario.deletadoEm).toBeNull();
      expect(usuario.criadoEm).toEqual(usuario.atualizadoEm);
    });
  });

  describe('reconstituir', () => {
    it('preserva id, timestamps e não marca como recém-criado', () => {
      const criadoEm = new Date('2024-01-01T00:00:00Z');
      const atualizadoEm = new Date('2024-02-01T00:00:00Z');

      const usuario = Usuario.reconstituir({
        idUsuario: 7,
        ...props,
        criadoEm,
        atualizadoEm,
        deletadoEm: null,
      });

      expect(usuario.idUsuario).toBe(7);
      expect(usuario.criadoEm).toBe(criadoEm);
      expect(usuario.atualizadoEm).toBe(atualizadoEm);
      expect(usuario.foiCriadoAgora).toBe(false);
    });
  });

  describe('alterar', () => {
    it('aplica todos os campos informados', () => {
      const usuario = Usuario.criar(props);

      usuario.alterar({
        nome: 'Ana Maria',
        email: 'ana.maria@oficina.com',
        senhaHash: 'hash-2',
        roles: Roles.mecanico,
      });

      expect(usuario.nome).toBe('Ana Maria');
      expect(usuario.email).toBe('ana.maria@oficina.com');
      expect(usuario.senhaHash).toBe('hash-2');
      expect(usuario.roles).toBe(Roles.mecanico);
    });

    it('ignora campos ausentes (alteração parcial)', () => {
      const usuario = Usuario.criar(props);

      usuario.alterar({ nome: 'Só o nome' });

      expect(usuario.nome).toBe('Só o nome');
      expect(usuario.email).toBe('ana@oficina.com');
      expect(usuario.senhaHash).toBe('hash-1');
      expect(usuario.roles).toBe(Roles.admin);
    });

    it('move atualizadoEm mesmo sem alterações efetivas', () => {
      const usuario = Usuario.criar(props);
      const antes = usuario.atualizadoEm;

      jest.useFakeTimers().setSystemTime(antes.getTime() + 60_000);
      usuario.alterar({});
      jest.useRealTimers();

      expect(usuario.atualizadoEm.getTime()).toBeGreaterThan(antes.getTime());
      expect(usuario.nome).toBe('Ana');
    });
  });

  describe('softDelete', () => {
    it('carimba o instante informado', () => {
      const usuario = Usuario.criar(props);
      const agora = new Date('2025-05-05T10:00:00Z');

      usuario.softDelete(agora);

      expect(usuario.deletadoEm).toBe(agora);
      expect(usuario.atualizadoEm).toBe(agora);
    });

    it('usa o instante atual quando nenhum é informado', () => {
      const usuario = Usuario.criar(props);

      usuario.softDelete();

      expect(usuario.deletadoEm).toBeInstanceOf(Date);
      expect(usuario.deletadoEm).toEqual(usuario.atualizadoEm);
    });
  });
});
