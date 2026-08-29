import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { criarAppDeTeste } from '../support/app';

interface RespostaHealth {
  status: string;
  info?: Record<string, { status: string }>;
  error?: Record<string, unknown>;
  details?: Record<string, { status: string }>;
}

/**
 * As probes do Kubernetes apontam para estas duas rotas
 * (k8s/40-api-deployment.yaml). Se elas mudarem de contrato, o pod nunca
 * fica Ready e o rollout trava em producao — falha cara e silenciosa, que
 * nenhum teste unitario pega porque depende do app inteiro de pe.
 */
describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    ({ app } = await criarAppDeTeste());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health/liveness', () => {
    it('responde 200 sem token — a probe do kubelet nao manda Authorization', async () => {
      const resposta = await request(app.getHttpServer())
        .get('/health/liveness')
        .expect(200);

      expect((resposta.body as RespostaHealth).status).toBe('ok');
    });
  });

  describe('GET /health/readiness', () => {
    it('responde 200 sem token e reporta o banco como up', async () => {
      const resposta = await request(app.getHttpServer())
        .get('/health/readiness')
        .expect(200);

      const health = resposta.body as RespostaHealth;
      expect(health.status).toBe('ok');
      expect(health.info?.prisma?.status).toBe('up');
    });

    it('checa o banco de verdade — readiness nao pode ser um 200 fixo', async () => {
      const resposta = await request(app.getHttpServer())
        .get('/health/readiness')
        .expect(200);

      // Se alguem trocar o indicator por um `return { status: 'ok' }`, o
      // deploy passa a subir pods que nao conseguem falar com o Postgres.
      expect((resposta.body as RespostaHealth).details).toHaveProperty(
        'prisma',
      );
    });
  });
});
