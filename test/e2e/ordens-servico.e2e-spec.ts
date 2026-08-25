import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../src/prisma/prisma.service';
import { DomainExceptionFilter } from '../../src/shared/infrastructure/http/domain-exception.filter';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';

interface OsBody {
  osId: string;
  status: string;
  valorFinal: number;
  mecanico: Record<string, unknown>;
  cliente: Record<string, unknown>;
  veiculo: Record<string, unknown>;
  servicosRealizados: unknown[];
  pecasUtilizadas: unknown[];
  insumosConsumidos: unknown[];
}

interface ListBody {
  length: number;
  [index: number]: OsBody;
}

interface MetricasBody {
  tempoMedioMs: number;
  tempoMedioMinutos: number;
  tempoMedioHoras: number;
}

describe('OrdemServico (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let mecanicoId: number;
  let clienteId: string;
  let veiculoId: string;
  let osId: string;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'joao.mecanico@oficina.com', senha: 'senha123' });
    authToken = (loginResponse.body as { accessToken: string }).accessToken;

    const mecanico = await prisma.usuario.findUnique({
      where: { email: 'joao.mecanico@oficina.com' },
    });
    mecanicoId = mecanico!.idUsuario;

    const cliente = await prisma.cliente.findUnique({
      where: { numDocumento: '123.456.789-09' },
    });
    clienteId = cliente!.clienteId;

    const veiculo = await prisma.veiculo.findUnique({
      where: { placa: 'ABC-1234' },
    });
    veiculoId = veiculo!.veiculoId;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /ordens-servico → cria OS', async () => {
    const response = await request(app.getHttpServer())
      .post('/ordens-servico')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ mecanicoId, clienteId, veiculoId })
      .expect(201);

    const body = response.body as OsBody;
    expect(body).toHaveProperty('osId');
    expect(body.status).toBe('recebida');
    expect(body.valorFinal).toBe(0);
    osId = body.osId;
  });

  it('GET /ordens-servico → retorna lista', async () => {
    const response = await request(app.getHttpServer())
      .get('/ordens-servico')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const body = response.body as ListBody;
    expect(Array.isArray(response.body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  it('GET /ordens-servico/metricas/tempo-medio → retorna shape correto', async () => {
    const response = await request(app.getHttpServer())
      .get('/ordens-servico/metricas/tempo-medio')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const body = response.body as MetricasBody;
    expect(body).toHaveProperty('tempoMedioMs');
    expect(body).toHaveProperty('tempoMedioMinutos');
    expect(body).toHaveProperty('tempoMedioHoras');
  });

  it('GET /ordens-servico/:id → retorna OS pelo id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/ordens-servico/${osId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const body = response.body as OsBody;
    expect(body.osId).toBe(osId);
    expect(body).toHaveProperty('mecanico');
    expect(body).toHaveProperty('cliente');
    expect(body).toHaveProperty('veiculo');
  });

  it('POST /ordens-servico/:id/servicos → adiciona serviço e valorFinal aumenta', async () => {
    const response = await request(app.getHttpServer())
      .post(`/ordens-servico/${osId}/servicos`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ servicoId: 1, quantidade: 1 })
      .expect(201);

    const body = response.body as OsBody;
    expect(body.valorFinal).toBeGreaterThan(0);
    expect(body.servicosRealizados).toHaveLength(1);
  });

  it('POST /ordens-servico/:id/pecas → adiciona peça e valorFinal aumenta', async () => {
    const prevResponse = await request(app.getHttpServer())
      .get(`/ordens-servico/${osId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    const prevValor = (prevResponse.body as OsBody).valorFinal;

    const response = await request(app.getHttpServer())
      .post(`/ordens-servico/${osId}/pecas`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ pecaId: 1, qtd: 2 })
      .expect(201);

    const body = response.body as OsBody;
    expect(body.valorFinal).toBeGreaterThan(prevValor);
    expect(body.pecasUtilizadas).toHaveLength(1);
  });

  it('POST /ordens-servico/:id/insumos → adiciona insumo', async () => {
    const response = await request(app.getHttpServer())
      .post(`/ordens-servico/${osId}/insumos`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ insumoId: 1, qtdConsumida: 3 })
      .expect(201);

    const body = response.body as OsBody;
    expect(body.insumosConsumidos).toHaveLength(1);
  });

  it('DELETE /ordens-servico/:id/insumos/1 → remove insumo', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/ordens-servico/${osId}/insumos/1`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const body = response.body as OsBody;
    expect(body.insumosConsumidos).toHaveLength(0);
  });

  it('PATCH /ordens-servico/:id/status → avança para em_diagnostico', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/ordens-servico/${osId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'em_diagnostico' })
      .expect(200);

    expect((response.body as OsBody).status).toBe('em_diagnostico');
  });

  it('PATCH /ordens-servico/:id/status → rejeita pulo de etapa (400)', async () => {
    await request(app.getHttpServer())
      .patch(`/ordens-servico/${osId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'finalizada' })
      .expect(400);
  });

  it('POST /ordens-servico/:id/aprovar-orcamento → rejeita quando status ≠ aguardando_aprovacao (400)', async () => {
    await request(app.getHttpServer())
      .post(`/ordens-servico/${osId}/aprovar-orcamento`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(400);
  });

  it('PATCH /ordens-servico/:id/status → avança para aguardando_aprovacao', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/ordens-servico/${osId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'aguardando_aprovacao' })
      .expect(200);

    expect((response.body as OsBody).status).toBe('aguardando_aprovacao');
  });

  it('POST /ordens-servico/:id/aprovar-orcamento → aprova e avança para em_execucao', async () => {
    const response = await request(app.getHttpServer())
      .post(`/ordens-servico/${osId}/aprovar-orcamento`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201);

    expect((response.body as OsBody).status).toBe('em_execucao');
  });

  it('PATCH /ordens-servico/:id/status → avança para finalizada', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/ordens-servico/${osId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'finalizada' })
      .expect(200);

    expect((response.body as OsBody).status).toBe('finalizada');
  });

  it('PATCH /ordens-servico/:id/status → avança para entregue', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/ordens-servico/${osId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'entregue' })
      .expect(200);

    expect((response.body as OsBody).status).toBe('entregue');
  });

  it('DELETE /ordens-servico/:id → soft delete retorna 204', async () => {
    await request(app.getHttpServer())
      .delete(`/ordens-servico/${osId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);
  });

  it('GET /ordens-servico/:id → retorna 404 após soft delete', async () => {
    await request(app.getHttpServer())
      .get(`/ordens-servico/${osId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });
});
