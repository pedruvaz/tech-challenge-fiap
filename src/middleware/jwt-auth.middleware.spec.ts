import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import type { NextFunction, Response } from 'express';
import type { ReqUser } from '../auth/types/req-user';
import { JwtAuthMiddleware } from './jwt-auth.middleware';

type ReqStub = {
  headers: Record<string, string>;
  method?: string;
  user?: ReqUser;
};

describe('JwtAuthMiddleware', () => {
  let middleware: JwtAuthMiddleware;

  const jwtMock = {
    verifyAsync: jest.fn(),
  };

  const configMock = {
    get: jest.fn().mockReturnValue('secret'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthMiddleware,
        { provide: JwtService, useValue: jwtMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    middleware = module.get<JwtAuthMiddleware>(JwtAuthMiddleware);
  });

  it('deve lançar UnauthorizedException quando não houver header de autorização', async () => {
    const req: ReqStub = { headers: {} };
    const next = jest.fn() as NextFunction;

    await expect(
      middleware.use(req as never, {} as Response, next),
    ).rejects.toThrow(UnauthorizedException);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve lançar UnauthorizedException quando o header não começar com Bearer', async () => {
    const req: ReqStub = { headers: { authorization: 'Basic token123' } };
    const next = jest.fn() as NextFunction;

    await expect(
      middleware.use(req as never, {} as Response, next),
    ).rejects.toThrow(UnauthorizedException);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve lançar UnauthorizedException quando o token for inválido', async () => {
    jwtMock.verifyAsync.mockRejectedValue(new Error('jwt expired'));
    const req: ReqStub = { headers: { authorization: 'Bearer invalid_token' } };
    const next = jest.fn() as NextFunction;

    await expect(
      middleware.use(req as never, {} as Response, next),
    ).rejects.toThrow(UnauthorizedException);
    expect(next).not.toHaveBeenCalled();
  });

  describe('token de funcionário válido', () => {
    it('deve normalizar payload e chamar next()', async () => {
      jwtMock.verifyAsync.mockResolvedValue({
        sub: 1,
        email: 'user@email.com',
        roles: 'admin',
      });

      const req: ReqStub = { headers: { authorization: 'Bearer valid_token' } };
      const next = jest.fn() as NextFunction;

      await middleware.use(req as never, {} as Response, next);

      expect(req.user).toEqual({
        tipo: 'FUNCIONARIO',
        usuarioId: 1,
        email: 'user@email.com',
        roles: 'admin',
      });
      expect(next).toHaveBeenCalled();
    });

    it.each([
      { sub: 1, email: 'a@b.com', roles: 'funcionario' },
      { sub: 1, email: 'a@b.com', roles: 'mecanico' },
    ])('aceita roles válido: $roles', async (rawPayload) => {
      jwtMock.verifyAsync.mockResolvedValue(rawPayload);
      const req: ReqStub = { headers: { authorization: 'Bearer token' } };
      await middleware.use(req as never, {} as Response, jest.fn());
      expect(req.user?.tipo).toBe('FUNCIONARIO');
    });
  });

  describe('token de cliente válido', () => {
    it('deve normalizar payload de cliente e chamar next()', async () => {
      jwtMock.verifyAsync.mockResolvedValue({
        sub: 'uuid-cliente-123',
        nome: 'João Silva',
        email: 'joao@email.com',
        tipo: 'CLIENTE',
      });

      const req: ReqStub = {
        headers: { authorization: 'Bearer cliente_token' },
      };
      const next = jest.fn() as NextFunction;

      await middleware.use(req as never, {} as Response, next);

      expect(req.user).toEqual({
        tipo: 'CLIENTE',
        clienteId: 'uuid-cliente-123',
        nome: 'João Silva',
        email: 'joao@email.com',
      });
      expect(next).toHaveBeenCalled();
    });

    it('aceita token de cliente sem email', async () => {
      jwtMock.verifyAsync.mockResolvedValue({
        sub: 'uuid-cliente-456',
        nome: 'Maria',
        tipo: 'CLIENTE',
      });
      const req: ReqStub = { headers: { authorization: 'Bearer token' } };
      await middleware.use(req as never, {} as Response, jest.fn());
      expect(req.user).toEqual({
        tipo: 'CLIENTE',
        clienteId: 'uuid-cliente-456',
        nome: 'Maria',
        email: undefined,
      });
    });
  });

  describe('payloads malformados', () => {
    it.each([
      {
        label: 'roles em lista',
        payload: { sub: 1, email: 'a@b.com', roles: ['admin'] },
      },
      {
        label: 'tipo desconhecido',
        payload: { sub: 'id', nome: 'X', tipo: 'ADMIN' },
      },
      {
        label: 'sub UUID em token funcionário (sem tipo)',
        payload: { sub: 'uuid', email: 'a@b.com', roles: 'admin' },
      },
      {
        label: 'sub numérico em token cliente',
        payload: { sub: 1, nome: 'X', tipo: 'CLIENTE' },
      },
      { label: 'cliente sem nome', payload: { sub: 'uuid', tipo: 'CLIENTE' } },
      {
        label: 'cliente com nome vazio',
        payload: { sub: 'uuid', nome: '', tipo: 'CLIENTE' },
      },
      { label: 'funcionário sem email', payload: { sub: 1, roles: 'admin' } },
      {
        label: 'funcionário com roles inválido',
        payload: { sub: 1, email: 'a@b.com', roles: 'superuser' },
      },
    ])('rejeita: $label', async ({ payload }) => {
      jwtMock.verifyAsync.mockResolvedValue(payload);
      const req: ReqStub = { headers: { authorization: 'Bearer token' } };
      await expect(
        middleware.use(req as never, {} as Response, jest.fn()),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  it('deve passar OPTIONS sem verificar token', async () => {
    const req: ReqStub = { method: 'OPTIONS', headers: {} };
    const next = jest.fn() as NextFunction;

    await middleware.use(req as never, {} as Response, next);

    expect(jwtMock.verifyAsync).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
