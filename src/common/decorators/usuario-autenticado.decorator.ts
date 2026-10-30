import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Função-fábrica do decorator (exportada para teste unitário).
 * Retorna o usuarioId numérico do funcionário autenticado.
 * Retorna undefined para clientes ou rotas não autenticadas.
 */
export const extrairUsuarioAutenticado = (
  _data: unknown,
  ctx: ExecutionContext,
): number | undefined => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const user = request.user;
  if (!user || user.tipo !== 'FUNCIONARIO') return undefined;
  return user.usuarioId;
};

/**
 * Injeta o usuarioId numérico do funcionário autenticado.
 * Retorna undefined para clientes ou rotas não autenticadas.
 */
export const UsuarioAutenticado = createParamDecorator(
  extrairUsuarioAutenticado,
);
