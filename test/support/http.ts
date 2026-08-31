import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

export interface ParDeTokens {
  accessToken: string;
  refreshToken: string;
}

/** Faz login de verdade pelo endpoint — nada de assinar JWT por fora. */
export async function login(
  app: INestApplication<App>,
  email: string,
  senha: string,
): Promise<ParDeTokens> {
  const resposta = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, senha })
    .expect(200);

  return resposta.body as ParDeTokens;
}

export const comToken = (token: string): string => `Bearer ${token}`;
