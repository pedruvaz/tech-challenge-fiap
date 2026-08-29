import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { PrismaService } from '../../src/prisma/prisma.service';
import { criarAppDeTeste } from '../support/app';
import { Fixtures } from '../support/fixtures';
import { comToken, login, ParDeTokens } from '../support/http';

/** Rota protegida qualquer, so para exercitar o middleware. */
const ROTA_PROTEGIDA = '/usuarios';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let fixtures: Fixtures;
  let email: string;
  let senha: string;

  beforeAll(async () => {
    ({ app, prisma } = await criarAppDeTeste());
    fixtures = new Fixtures(prisma);
    ({ email, senha } = await fixtures.criarUsuario());
  });

  afterAll(async () => {
    await fixtures.limpar();
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('devolve o par de tokens com credenciais validas', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, senha })
        .expect(200);

      const tokens = resposta.body as ParDeTokens;
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
      expect(tokens.accessToken.split('.')).toHaveLength(3);
    });

    it('nao vaza a senha nem o hash na resposta', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, senha })
        .expect(200);

      expect(JSON.stringify(resposta.body)).not.toContain(senha);
      expect(JSON.stringify(resposta.body)).not.toContain('$2b$');
    });

    it('recusa senha errada com 401', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, senha: 'senha-errada' })
        .expect(401);
    });

    it('recusa e-mail inexistente com 401 — mesma mensagem da senha errada', async () => {
      const inexistente = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'ninguem@e2e.test', senha })
        .expect(401);

      const senhaErrada = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, senha: 'senha-errada' })
        .expect(401);

      // Mensagens diferentes permitiriam enumerar quais e-mails existem.
      expect((inexistente.body as { message: string }).message).toBe(
        (senhaErrada.body as { message: string }).message,
      );
    });

    it('rejeita payload malformado com 400', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nao-e-email', senha })
        .expect(400);
    });

    it('rejeita campo estranho no corpo (forbidNonWhitelisted)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, senha, admin: true })
        .expect(400);
    });
  });

  describe('middleware JWT', () => {
    it('bloqueia rota protegida sem token (401)', async () => {
      await request(app.getHttpServer()).get(ROTA_PROTEGIDA).expect(401);
    });

    it('bloqueia token sintaticamente invalido (401)', async () => {
      await request(app.getHttpServer())
        .get(ROTA_PROTEGIDA)
        .set('Authorization', comToken('nao-e-um-jwt'))
        .expect(401);
    });

    it('bloqueia token bem formado mas assinado com outra chave (401)', async () => {
      // Header/payload validos, assinatura lixo.
      const falso =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJzdWIiOjEsImVtYWlsIjoiYUBiLmMiLCJyb2xlcyI6ImFkbWluIn0.' +
        'assinatura-invalida';
      await request(app.getHttpServer())
        .get(ROTA_PROTEGIDA)
        .set('Authorization', comToken(falso))
        .expect(401);
    });

    it('libera rota protegida com token valido', async () => {
      const { accessToken } = await login(app, email, senha);
      await request(app.getHttpServer())
        .get(ROTA_PROTEGIDA)
        .set('Authorization', comToken(accessToken))
        .expect(200);
    });

    it('deixa o preflight OPTIONS passar sem Authorization', async () => {
      // O browser nao manda Authorization no preflight. Se o middleware
      // barrasse OPTIONS, toda chamada autenticada do front quebraria no
      // CORS antes de sair. Ver jwt-auth.middleware.ts.
      const resposta = await request(app.getHttpServer())
        .options(ROTA_PROTEGIDA)
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'GET');

      expect(resposta.status).not.toBe(401);
      expect(resposta.headers['access-control-allow-origin']).toBe(
        'http://localhost:5173',
      );
    });
  });

  describe('POST /auth/refresh', () => {
    it('rotaciona o par e invalida o refresh anterior', async () => {
      const primeiro = await login(app, email, senha);

      const resposta = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: primeiro.refreshToken })
        .expect(200);

      const segundo = resposta.body as ParDeTokens;
      expect(segundo.refreshToken).not.toBe(primeiro.refreshToken);

      // O antigo tem que morrer: sem isso, um refresh vazado vale para sempre.
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: primeiro.refreshToken })
        .expect(401);

      // E o novo tem que funcionar.
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: segundo.refreshToken })
        .expect(200);
    });

    it('recusa refresh token invalido com 401', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'lixo' })
        .expect(401);
    });

    it('recusa um access token no lugar do refresh', async () => {
      const { accessToken } = await login(app, email, senha);
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: accessToken })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('revoga o refresh token da sessao', async () => {
      const tokens = await login(app, email, senha);

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', comToken(tokens.accessToken))
        .expect(204);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: tokens.refreshToken })
        .expect(401);
    });

    it('exige autenticacao para deslogar', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });
  });
});
