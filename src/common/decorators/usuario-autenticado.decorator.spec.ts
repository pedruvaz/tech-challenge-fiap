import { ExecutionContext } from '@nestjs/common';
import { Roles } from '@prisma/client';
import { extrairUsuarioAutenticado } from './usuario-autenticado.decorator';

const makeCtx = (user?: {
  sub: number;
  email?: string;
  roles?: Roles;
}): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext;

describe('extrairUsuarioAutenticado', () => {
  it('retorna o sub do usuário autenticado', () => {
    const ctx = makeCtx({ sub: 42, email: 'a@b.c', roles: 'admin' as Roles });
    expect(extrairUsuarioAutenticado(undefined, ctx)).toBe(42);
  });

  it('retorna undefined quando não há usuário no request', () => {
    expect(extrairUsuarioAutenticado(undefined, makeCtx())).toBeUndefined();
  });
});
