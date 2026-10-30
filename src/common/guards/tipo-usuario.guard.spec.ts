import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACESSO_CLIENTE_KEY } from '../decorators/acesso-cliente.decorator';
import { TipoUsuarioGuard } from './tipo-usuario.guard';

describe('TipoUsuarioGuard', () => {
  let reflector: Reflector;
  let guard: TipoUsuarioGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
    guard = new TipoUsuarioGuard(reflector);
  });

  const ctx = (user: unknown, acessoCliente = false): ExecutionContext => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(acessoCliente);
    return {
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  it('permite funcionário em rota sem @AcessoCliente', () => {
    const user = {
      tipo: 'FUNCIONARIO',
      usuarioId: 1,
      email: 'a@b.com',
      roles: 'admin',
    };
    expect(guard.canActivate(ctx(user, false))).toBe(true);
  });

  it('permite funcionário em rota com @AcessoCliente', () => {
    const user = {
      tipo: 'FUNCIONARIO',
      usuarioId: 1,
      email: 'a@b.com',
      roles: 'admin',
    };
    expect(guard.canActivate(ctx(user, true))).toBe(true);
  });

  it('permite cliente em rota com @AcessoCliente', () => {
    const user = { tipo: 'CLIENTE', clienteId: 'uuid', nome: 'João' };
    expect(guard.canActivate(ctx(user, true))).toBe(true);
  });

  it('bloqueia cliente em rota sem @AcessoCliente (ForbiddenException)', () => {
    const user = { tipo: 'CLIENTE', clienteId: 'uuid', nome: 'João' };
    expect(() => guard.canActivate(ctx(user, false))).toThrow(
      ForbiddenException,
    );
  });

  it('bloqueia request sem user (ForbiddenException)', () => {
    expect(() => guard.canActivate(ctx(undefined, false))).toThrow(
      ForbiddenException,
    );
  });

  it('usa ACESSO_CLIENTE_KEY como chave do reflector', () => {
    const user = { tipo: 'CLIENTE', clienteId: 'uuid', nome: 'João' };
    guard.canActivate(ctx(user, true));
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      ACESSO_CLIENTE_KEY,
      expect.any(Array),
    );
  });
});
