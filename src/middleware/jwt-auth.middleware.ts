import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Roles } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import type { ReqUser } from '../auth/types/req-user';

const ROLES_VALIDOS: ReadonlySet<string> = new Set([
  'admin',
  'funcionario',
  'mecanico',
]);

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.method === 'OPTIONS') {
      next();
      return;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de acesso não informado');
    }

    const token = authHeader.slice('Bearer '.length);

    try {
      const raw = await this.jwtService.verifyAsync<Record<string, unknown>>(
        token,
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          algorithms: ['HS256'],
        },
      );

      const user = this.normalizar(raw);
      if (!user) {
        throw new UnauthorizedException('Token com formato inválido');
      }

      req.user = user;
      next();
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Token de acesso inválido ou expirado');
    }
  }

  private normalizar(raw: Record<string, unknown>): ReqUser | null {
    // Token de cliente: tem campo `tipo`
    if ('tipo' in raw) {
      if (
        raw['tipo'] === 'CLIENTE' &&
        typeof raw['sub'] === 'string' &&
        raw['sub'].length > 0 &&
        typeof raw['nome'] === 'string' &&
        raw['nome'].length > 0
      ) {
        return {
          tipo: 'CLIENTE',
          clienteId: raw['sub'],
          nome: raw['nome'],
          email: typeof raw['email'] === 'string' ? raw['email'] : undefined,
        };
      }
      return null;
    }

    // Token de funcionário: sub numérico, roles enum, sem `tipo`
    if (
      typeof raw['sub'] === 'number' &&
      Number.isFinite(raw['sub']) &&
      typeof raw['email'] === 'string' &&
      typeof raw['roles'] === 'string' &&
      ROLES_VALIDOS.has(raw['roles'])
    ) {
      return {
        tipo: 'FUNCIONARIO',
        usuarioId: raw['sub'],
        email: raw['email'],
        roles: raw['roles'] as Roles,
      };
    }

    return null;
  }
}
