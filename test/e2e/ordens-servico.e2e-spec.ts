import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../src/prisma/prisma.service';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';

describe('OrdemServico (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let mecanicoId: number;
  let clienteId: string;
  let veiculoId: string;
  let osId: string;

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
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

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
      .send({ mecanicoId, clienteId, veiculoId })
      .expect(201);

    expect(response.body).toHaveProperty('osId');
    expect(response.body.status).toBe('recebida');
    expect(response.body.valorFinal).toBe(0);
    osId = response.body.osId;
  });

  it('GET /ordens-servico → retorna lista', async () => {
    const response = await request(app.getHttpServer())
      .get('/ordens-servico')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /ordens-servico/metricas/tempo-medio → retorna shape correto', async () => {
    const response = await request(app.getHttpServer())
      .get('/ordens-servico/metricas/tempo-medio')
      .expect(200);

    expect(response.body).toHaveProperty('tempoMedioMs');
    expect(response.body).toHaveProperty('tempoMedioMinutos');
    expect(response.body).toHaveProperty('tempoMedioHoras');
  });

  it('GET /ordens-servico/:id → retorna OS pelo id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/ordens-servico/${osId}`)
      .expect(200);

    expect(response.body.osId).toBe(osId);
    expect(response.body).toHaveProperty('mecanico');
    expect(response.body).toHaveProperty('cliente');
    expect(response.body).toHaveProperty('veiculo');
  });

  it('POST /ordens-servico/:id/servicos → adiciona serviço e valorFinal aumenta', async () => {
    const response = await request(app.getHttpServer())
      .post(`/ordens-servico/${osId}/servicos`)
      .send({ servicoId: 1, quantidade: 1 })
      .expect(201);

    expect(response.body.valorFinal).toBeGreaterThan(0);
    expect(response.body.servicosRealizados).toHaveLength(1);
  });

  it('POST /ordens-servico/:id/pecas → adiciona peça e valorFinal aumenta', async () => {
    const prevResponse = await request(app.getHttpServer())
      .get(`/ordens-servico/${osId}`)
      .expect(200);
    const prevValor = prevResponse.body.valorFinal;

    const response = await request(app.getHttpServer())
      .post(`/ordens-servico/${osId}/pecas`)
      .send({ pecaId: 1, qtd: 2 })
      .expect(201);

    expect(response.body.valorFinal).toBeGreaterThan(prevValor);
    expect(response.body.pecasUtilizadas).toHaveLength(1);
  });

  it('POST /ordens-servico/:id/insumos → adiciona insumo', async () => {
    const response = await request(app.getHttpServer())
      .post(`/ordens-servico/${osId}/insumos`)
      .send({ insumoId: 1, qtdConsumida: 3 })
      .expect(201);

    expect(response.body.insumosConsumidos).toHaveLength(1);
  });

  it('DELETE /ordens-servico/:id/insumos/1 → remove insumo', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/ordens-servico/${osId}/insumos/1`)
      .expect(200);

    expect(response.body.insumosConsumidos).toHaveLength(0);
  });

  it('PATCH /ordens-servico/:id/status → avança para em_diagnostico', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/ordens-servico/${osId}/status`)
      .send({ status: 'em_diagnostico' })
      .expect(200);

    expect(response.body.status).toBe('em_diagnostico');
  });

  it('PATCH /ordens-servico/:id/status → rejeita pulo de etapa (400)', async () => {
    await request(app.getHttpServer())
      .patch(`/ordens-servico/${osId}/status`)
      .send({ status: 'finalizada' })
      .expect(400);
  });

  it('PATCH /ordens-servico/:id/status → avança para aguardando_aprovacao', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/ordens-servico/${osId}/status`)
      .send({ status: 'aguardando_aprovacao' })
      .expect(200);

    expect(response.body.status).toBe('aguardando_aprovacao');
  });

  it('PATCH /ordens-servico/:id/status → avança para em_execucao', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/ordens-servico/${osId}/status`)
      .send({ status: 'em_execucao' })
      .expect(200);

    expect(response.body.status).toBe('em_execucao');
  });

  it('PATCH /ordens-servico/:id/status → avança para finalizada', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/ordens-servico/${osId}/status`)
      .send({ status: 'finalizada' })
      .expect(200);

    expect(response.body.status).toBe('finalizada');
  });

  it('PATCH /ordens-servico/:id/status → avança para entregue', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/ordens-servico/${osId}/status`)
      .send({ status: 'entregue' })
      .expect(200);

    expect(response.body.status).toBe('entregue');
  });

  it('DELETE /ordens-servico/:id → soft delete retorna 204', async () => {
    await request(app.getHttpServer())
      .delete(`/ordens-servico/${osId}`)
      .expect(204);
  });

  it('GET /ordens-servico/:id → retorna 404 após soft delete', async () => {
    await request(app.getHttpServer())
      .get(`/ordens-servico/${osId}`)
      .expect(404);
  });
});
