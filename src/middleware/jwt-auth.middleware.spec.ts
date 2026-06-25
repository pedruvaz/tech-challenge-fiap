import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import type { NextFunction, Request, Response } from 'express';
import { JwtAuthMiddleware } from './jwt-auth.middleware';

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
    const req = { headers: {} } as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    await expect(middleware.use(req, res, next)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('deve lançar UnauthorizedException quando o header não começar com Bearer', async () => {
    const req = {
      headers: { authorization: 'Basic token123' },
    } as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    await expect(middleware.use(req, res, next)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('deve definir req.user e chamar next() com token válido', async () => {
    const payload = { sub: 1, email: 'user@email.com', roles: ['admin'] };
    jwtMock.verifyAsync.mockResolvedValue(payload);

    const req = {
      headers: { authorization: 'Bearer valid_token' },
    } as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    await middleware.use(req, res, next);

    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalled();
  });

  it('deve lançar UnauthorizedException quando o token for inválido', async () => {
    jwtMock.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    const req = {
      headers: { authorization: 'Bearer invalid_token' },
    } as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    await expect(middleware.use(req, res, next)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(next).not.toHaveBeenCalled();
  });
});
