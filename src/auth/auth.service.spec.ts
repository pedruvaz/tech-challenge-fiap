import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const usuarioMock = {
    idUsuario: 1,
    nome: 'Admin',
    email: 'admin@email.com',
    senha: 'hashed_password',
    roles: ['admin'],
    refreshToken: 'hashed_refresh',
    deletadoEm: null,
  };

  const tokensMock = {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
  };

  const prismaMock = {
    usuario: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const jwtMock = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const configMock = {
    get: jest.fn().mockReturnValue('secret'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('deve autenticar o usuário e retornar tokens', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue(usuarioMock);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtMock.signAsync.mockResolvedValueOnce(tokensMock.accessToken);
      jwtMock.signAsync.mockResolvedValueOnce(tokensMock.refreshToken);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prismaMock.usuario.update.mockResolvedValue(usuarioMock);

      const resultado = await service.login({
        email: usuarioMock.email,
        senha: 'senha123',
      });

      expect(resultado.accessToken).toBe(tokensMock.accessToken);
      expect(resultado.usuario.email).toBe(usuarioMock.email);
    });

    it('deve lançar UnauthorizedException se o usuário não existir', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'naoexiste@email.com', senha: 'senha123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se o usuário estiver deletado', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({
        ...usuarioMock,
        deletadoEm: new Date(),
      });

      await expect(
        service.login({ email: usuarioMock.email, senha: 'senha123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se a senha for inválida', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue(usuarioMock);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: usuarioMock.email, senha: 'senha_errada' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('deve renovar os tokens com um refresh token válido', async () => {
      jwtMock.verifyAsync.mockResolvedValue({
        sub: 1,
        email: usuarioMock.email,
        roles: usuarioMock.roles,
      });
      prismaMock.usuario.findUnique.mockResolvedValue(usuarioMock);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtMock.signAsync.mockResolvedValueOnce(tokensMock.accessToken);
      jwtMock.signAsync.mockResolvedValueOnce(tokensMock.refreshToken);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prismaMock.usuario.update.mockResolvedValue(usuarioMock);

      const resultado = await service.refresh('valid_refresh_token');

      expect(resultado.accessToken).toBe(tokensMock.accessToken);
    });

    it('deve lançar UnauthorizedException se o refresh token for inválido', async () => {
      jwtMock.verifyAsync.mockRejectedValue(new Error('invalid'));

      await expect(service.refresh('token_invalido')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException se o usuário não tiver refresh token salvo', async () => {
      jwtMock.verifyAsync.mockResolvedValue({ sub: 1 });
      prismaMock.usuario.findUnique.mockResolvedValue({
        ...usuarioMock,
        refreshToken: null,
      });

      await expect(service.refresh('any_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException se o refresh token não corresponder ao salvo', async () => {
      jwtMock.verifyAsync.mockResolvedValue({ sub: 1 });
      prismaMock.usuario.findUnique.mockResolvedValue(usuarioMock);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refresh('token_diferente')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('deve remover o refresh token do usuário', async () => {
      prismaMock.usuario.update.mockResolvedValue(usuarioMock);

      await service.logout(1);

      expect(prismaMock.usuario.update).toHaveBeenCalledWith({
        where: { idUsuario: 1 },
        data: { refreshToken: null },
      });
    });
  });
});
