import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const tokensMock = {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
    usuario: { id: 1, nome: 'Admin', email: 'admin@email.com', roles: ['admin'] },
  };

  const serviceMock = {
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: serviceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('deve autenticar e retornar tokens', async () => {
      serviceMock.login.mockResolvedValue(tokensMock);

      const resultado = await controller.login({
        email: 'admin@email.com',
        senha: 'senha123',
      });

      expect(serviceMock.login).toHaveBeenCalledWith({
        email: 'admin@email.com',
        senha: 'senha123',
      });
      expect(resultado).toEqual(tokensMock);
    });
  });

  describe('refresh', () => {
    it('deve renovar os tokens', async () => {
      const novosPares = {
        accessToken: 'novo_access',
        refreshToken: 'novo_refresh',
      };
      serviceMock.refresh.mockResolvedValue(novosPares);

      const resultado = await controller.refresh({
        refreshToken: 'refresh_token',
      });

      expect(serviceMock.refresh).toHaveBeenCalledWith('refresh_token');
      expect(resultado).toEqual(novosPares);
    });
  });

  describe('logout', () => {
    it('deve fazer logout do usuário autenticado', async () => {
      serviceMock.logout.mockResolvedValue(undefined);

      const reqMock = {
        user: { sub: 1, email: 'admin@email.com', roles: ['admin'] },
      } as any;

      await controller.logout(reqMock);

      expect(serviceMock.logout).toHaveBeenCalledWith(1);
    });
  });
});
