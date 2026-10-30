import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ACESSO_CLIENTE_KEY } from '../decorators/acesso-cliente.decorator';

@Injectable()
export class TipoUsuarioGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Acesso negado');
    }

    if (user.tipo === 'FUNCIONARIO') {
      return true;
    }

    // CLIENTE: só passa se a rota tiver @AcessoCliente()
    const acessoCliente = this.reflector.getAllAndOverride<boolean>(
      ACESSO_CLIENTE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!acessoCliente) {
      throw new ForbiddenException('Acesso restrito a funcionários');
    }

    return true;
  }
}
