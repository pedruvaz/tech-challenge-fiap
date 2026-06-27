import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Função-fábrica do decorator (exportada para teste unitário).
 * Extrai o id do usuário autenticado (`sub` do JWT) do request.
 */
export const extrairUsuarioAutenticado = (
  _data: unknown,
  ctx: ExecutionContext,
): number | undefined => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return request.user?.sub;
};

/**
 * Injeta o id do usuário autenticado no handler. O `req.user` é populado
 * pelo `JwtAuthMiddleware`. Retorna `undefined` em rotas não autenticadas.
 */
export const UsuarioAutenticado = createParamDecorator(
  extrairUsuarioAutenticado,
);
