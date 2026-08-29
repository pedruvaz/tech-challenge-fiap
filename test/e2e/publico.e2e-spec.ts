import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import request from 'supertest';
import type { App } from 'supertest/types';
import { PrismaService } from '../../src/prisma/prisma.service';
import { criarAppDeTeste } from '../support/app';
import { Fixtures, gerarCpf } from '../support/fixtures';

const rota = (osId: string): string => `/publico/ordens-servico/${osId}`;

/**
 * Esta e a unica rota de negocio fora do JWT (app.module.ts). A prova de
 * posse e o CPF/CNPJ do dono, entao o que importa testar aqui nao e o
 * caminho feliz — e o que acontece quando o documento nao confere.
 */
describe('Consulta publica da OS (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let fixtures: Fixtures;
  let osId: string;
  let numDocumento: string;

  beforeAll(async () => {
    ({ app, prisma } = await criarAppDeTeste());
    fixtures = new Fixtures(prisma);
    ({ osId, numDocumento } = await fixtures.cenarioBase());
  });

  afterAll(async () => {
    await fixtures.limpar();
    await app.close();
  });

  it('retorna a OS para o dono, sem nenhum token', async () => {
    const resposta = await request(app.getHttpServer())
      .get(rota(osId))
      .query({ numDocumento })
      .expect(200);

    expect((resposta.body as { osId: string }).osId).toBe(osId);
  });

  it('aceita o documento com e sem mascara', async () => {
    const semMascara = numDocumento.replace(/\D/g, '');

    await request(app.getHttpServer())
      .get(rota(osId))
      .query({ numDocumento: semMascara })
      .expect(200);
  });

  it('recusa documento de outra pessoa com 403', async () => {
    await request(app.getHttpServer())
      .get(rota(osId))
      .query({ numDocumento: gerarCpf() })
      .expect(403);
  });

  it('nao devolve dado nenhum da OS quando o documento nao confere', async () => {
    const resposta = await request(app.getHttpServer())
      .get(rota(osId))
      .query({ numDocumento: gerarCpf() })
      .expect(403);

    // O corpo do erro nao pode carregar nada do cliente ou do veiculo.
    expect(resposta.body).not.toHaveProperty('cliente');
    expect(resposta.body).not.toHaveProperty('veiculo');
    expect(resposta.text).not.toContain(numDocumento);
  });

  it('exige o numDocumento — sem ele, 400', async () => {
    await request(app.getHttpServer()).get(rota(osId)).expect(400);
  });

  it('rejeita numDocumento vazio ou so espacos com 400', async () => {
    await request(app.getHttpServer())
      .get(rota(osId))
      .query({ numDocumento: '   ' })
      .expect(400);
  });

  it('rejeita id que nao e uuid com 400', async () => {
    await request(app.getHttpServer())
      .get(rota('123'))
      .query({ numDocumento })
      .expect(400);
  });

  it('devolve 404 para uuid valido que nao existe', async () => {
    // Nota: OS inexistente da 404 e documento errado da 403, entao os dois
    // casos sao distinguiveis de fora. Na pratica o id e um UUID v4, que nao
    // e enumeravel — mas se algum dia virar id sequencial, isso vira
    // vazamento e este teste e o lugar de lembrar disso.
    await request(app.getHttpServer())
      .get(rota(randomUUID()))
      .query({ numDocumento })
      .expect(404);
  });

  it('continua publica mesmo com Authorization invalido no cabecalho', async () => {
    // A rota esta na lista de exclusao do middleware; um header lixo nao
    // pode transformar 200 em 401.
    await request(app.getHttpServer())
      .get(rota(osId))
      .set('Authorization', 'Bearer lixo')
      .query({ numDocumento })
      .expect(200);
  });
});
