import { Roles } from '@prisma/client';
import { Usuario } from '../../domain/entities/usuario.entity';
import { UsuarioPresenter } from './usuario.presenter';

const persistido = (idUsuario = 7, nome = 'Ana'): Usuario =>
  Usuario.reconstituir({
    idUsuario,
    nome,
    email: `${nome.toLowerCase()}@oficina.com`,
    senhaHash: 'hash-secreto',
    roles: Roles.admin,
    criadoEm: new Date('2024-01-01T00:00:00Z'),
    atualizadoEm: new Date('2024-02-01T00:00:00Z'),
    deletadoEm: null,
  });

describe('UsuarioPresenter', () => {
  it('monta o DTO a partir da entidade', () => {
    const dto = UsuarioPresenter.apresentar(persistido());

    expect(dto).toMatchObject({
      idUsuario: 7,
      nome: 'Ana',
      email: 'ana@oficina.com',
      roles: Roles.admin,
    });
  });

  it('nunca expõe o hash da senha', () => {
    const dto = UsuarioPresenter.apresentar(persistido());

    expect(Object.keys(dto)).not.toContain('senhaHash');
    expect(Object.keys(dto)).not.toContain('senha');
    expect(JSON.stringify(dto)).not.toContain('hash-secreto');
  });

  it('recusa apresentar usuário sem id (invariante)', () => {
    const semId = Usuario.criar({
      nome: 'Ana',
      email: 'ana@oficina.com',
      senhaHash: 'h',
      roles: Roles.admin,
    });

    expect(() => UsuarioPresenter.apresentar(semId)).toThrow(
      'invariante violada',
    );
  });

  it('apresenta listas preservando a ordem', () => {
    const dtos = UsuarioPresenter.apresentarLista([
      persistido(7, 'Ana'),
      persistido(8, 'Bruno'),
    ]);

    expect(dtos.map((d) => d.idUsuario)).toEqual([7, 8]);
  });

  it('apresenta lista vazia', () => {
    expect(UsuarioPresenter.apresentarLista([])).toEqual([]);
  });
});
