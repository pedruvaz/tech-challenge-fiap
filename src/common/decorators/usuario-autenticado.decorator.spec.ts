import { ExecutionContext } from '@nestjs/common';
import type { ReqUser } from '../../auth/types/req-user';
import { extrairUsuarioAutenticado } from './usuario-autenticado.decorator';

const makeCtx = (user?: ReqUser): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext;

describe('extrairUsuarioAutenticado', () => {
  it('retorna usuarioId numérico para token de funcionário', () => {
    const ctx = makeCtx({
      tipo: 'FUNCIONARIO',
      usuarioId: 42,
      email: 'a@b.c',
      roles: 'admin',
    });
    expect(extrairUsuarioAutenticado(undefined, ctx)).toBe(42);
  });

  it('retorna undefined para token de cliente (sem usuarioId numérico)', () => {
    const ctx = makeCtx({
      tipo: 'CLIENTE',
      clienteId: 'uuid-123',
      nome: 'João',
    });
    expect(extrairUsuarioAutenticado(undefined, ctx)).toBeUndefined();
  });

  it('retorna undefined quando não há usuário no request', () => {
    expect(extrairUsuarioAutenticado(undefined, makeCtx())).toBeUndefined();
  });
});
