import { INestApplication } from '@nestjs/common';
import { Status } from '@prisma/client';
import { randomUUID } from 'crypto';
import request from 'supertest';
import type { App } from 'supertest/types';
import { PrismaService } from '../../src/prisma/prisma.service';
import { criarAppDeTeste, EmailServiceFake } from '../support/app';
import { Fixtures } from '../support/fixtures';
import { comToken, login } from '../support/http';

const UM_DIA = 24 * 60 * 60 * 1000;

/**
 * O fluxo de aprovacao por e-mail e o unico do sistema que um estranho
 * dispara: quem clica no link nao esta autenticado, so tem o token. Isso faz
 * das regras do token (uso unico, expiracao, status da OS) a superficie mais
 * sensivel da aplicacao — e ate agora ela so tinha teste unitario.
 */
describe('Aprovacao de orcamento (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let email: EmailServiceFake;
  let fixtures: Fixtures;
  let token: string;

  /** OS pronta para ser enviada ao cliente, com o token ja emitido. */
  const osComTokenEmitido = async (): Promise<{
    osId: string;
    tokenAprovacao: string;
  }> => {
    const cenario = await fixtures.cenarioBase(Status.em_diagnostico);

    await request(app.getHttpServer())
      .post(`/aprovacao/${cenario.osId}/solicitar`)
      .set('Authorization', comToken(token))
      .expect(204);

    const registro = await prisma.tokenAprovacao.findFirstOrThrow({
      where: { ordemServicoId: cenario.osId },
    });

    return { osId: cenario.osId, tokenAprovacao: registro.token };
  };

  const statusDaOs = async (osId: string): Promise<Status> => {
    const os = await prisma.ordemServico.findUniqueOrThrow({ where: { osId } });
    return os.status;
  };

  beforeAll(async () => {
    ({ app, prisma, email } = await criarAppDeTeste());
    fixtures = new Fixtures(prisma);
    const dono = await fixtures.criarUsuario();
    ({ accessToken: token } = await login(app, dono.email, dono.senha));
  });

  beforeEach(() => {
    email.limpar();
  });

  afterAll(async () => {
    await fixtures.limpar();
    await app.close();
  });

  describe('POST /aprovacao/:osId/solicitar', () => {
    it('emite o token, move a OS para aguardando_aprovacao e dispara o e-mail', async () => {
      const cenario = await fixtures.cenarioBase(Status.em_diagnostico);

      await request(app.getHttpServer())
        .post(`/aprovacao/${cenario.osId}/solicitar`)
        .set('Authorization', comToken(token))
        .expect(204);

      expect(await statusDaOs(cenario.osId)).toBe(Status.aguardando_aprovacao);

      const registro = await prisma.tokenAprovacao.findFirstOrThrow({
        where: { ordemServicoId: cenario.osId },
      });
      expect(registro.usedAt).toBeNull();
      expect(registro.expiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(registro.emailCliente).toBe(cenario.emailCliente);

      expect(email.enviados).toHaveLength(1);
      expect(email.ultimo?.emailCliente).toBe(cenario.emailCliente);
    });

    it('grava a transicao no historico', async () => {
      const cenario = await fixtures.cenarioBase(Status.em_diagnostico);

      await request(app.getHttpServer())
        .post(`/aprovacao/${cenario.osId}/solicitar`)
        .set('Authorization', comToken(token))
        .expect(204);

      const historico = await prisma.historicoStatusOrdemServico.findMany({
        where: { osId: cenario.osId },
      });
      expect(historico).toHaveLength(1);
      expect(historico[0].statusAnterior).toBe(Status.em_diagnostico);
      expect(historico[0].statusNovo).toBe(Status.aguardando_aprovacao);
    });

    it('monta links absolutos e sem "undefined" na base', async () => {
      // Guarda do fix do APP_URL: sem fallback, os links saiam como
      // "undefined/aprovacao/confirmar" com o e-mail entregue normalmente.
      const cenario = await fixtures.cenarioBase(Status.em_diagnostico);

      await request(app.getHttpServer())
        .post(`/aprovacao/${cenario.osId}/solicitar`)
        .set('Authorization', comToken(token))
        .expect(204);

      const enviado = email.ultimo;
      expect(enviado).toBeDefined();
      expect(enviado?.linkAprovar).not.toContain('undefined');
      expect(enviado?.linkRejeitar).not.toContain('undefined');
      expect(enviado?.linkAprovar).toMatch(
        /^https?:\/\/.+\/aprovacao\/confirmar\?token=.+&acao=aprovar$/,
      );
      expect(enviado?.linkRejeitar).toMatch(/acao=rejeitar$/);
      expect(enviado?.linkAprovar).not.toContain('//aprovacao');
    });

    it('recusa OS que nao esta em em_diagnostico (400) e nao emite token', async () => {
      const cenario = await fixtures.cenarioBase(Status.recebida);

      await request(app.getHttpServer())
        .post(`/aprovacao/${cenario.osId}/solicitar`)
        .set('Authorization', comToken(token))
        .expect(400);

      const tokens = await prisma.tokenAprovacao.findMany({
        where: { ordemServicoId: cenario.osId },
      });
      expect(tokens).toHaveLength(0);
      expect(email.enviados).toHaveLength(0);
    });

    it('recusa cliente sem e-mail cadastrado (400)', async () => {
      const usuario = await fixtures.criarUsuario();
      const cliente = await fixtures.criarCliente({ email: null });
      const veiculoId = await fixtures.criarVeiculo(cliente.clienteId);
      const osId = await fixtures.criarOrdemServico({
        usuarioId: usuario.idUsuario,
        clienteId: cliente.clienteId,
        veiculoId,
        status: Status.em_diagnostico,
      });

      await request(app.getHttpServer())
        .post(`/aprovacao/${osId}/solicitar`)
        .set('Authorization', comToken(token))
        .expect(400);

      expect(await statusDaOs(osId)).toBe(Status.em_diagnostico);
      expect(email.enviados).toHaveLength(0);
    });

    it('devolve 404 para OS inexistente', async () => {
      await request(app.getHttpServer())
        .post(`/aprovacao/${randomUUID()}/solicitar`)
        .set('Authorization', comToken(token))
        .expect(404);
    });

    it('exige autenticacao — quem solicita e a oficina, nao o cliente', async () => {
      const cenario = await fixtures.cenarioBase(Status.em_diagnostico);

      await request(app.getHttpServer())
        .post(`/aprovacao/${cenario.osId}/solicitar`)
        .expect(401);
    });
  });

  describe('GET /aprovacao/confirmar', () => {
    it('abre a pagina de confirmacao sem exigir token JWT', async () => {
      const { tokenAprovacao } = await osComTokenEmitido();

      const resposta = await request(app.getHttpServer())
        .get('/aprovacao/confirmar')
        .query({ token: tokenAprovacao, acao: 'aprovar' })
        .expect(200);

      expect(resposta.headers['content-type']).toContain('text/html');
    });

    it('nao muda o status — a tela so pergunta, quem decide e o POST', async () => {
      const { osId, tokenAprovacao } = await osComTokenEmitido();

      await request(app.getHttpServer())
        .get('/aprovacao/confirmar')
        .query({ token: tokenAprovacao, acao: 'aprovar' })
        .expect(200);

      expect(await statusDaOs(osId)).toBe(Status.aguardando_aprovacao);
      const registro = await prisma.tokenAprovacao.findUniqueOrThrow({
        where: { token: tokenAprovacao },
      });
      expect(registro.usedAt).toBeNull();
    });

    it('recusa token inexistente com 400', async () => {
      await request(app.getHttpServer())
        .get('/aprovacao/confirmar')
        .query({ token: randomUUID(), acao: 'aprovar' })
        .expect(400);
    });

    it('recusa token expirado com 410', async () => {
      const { osId } = await osComTokenEmitido();
      const expirado = randomUUID();
      await prisma.tokenAprovacao.create({
        data: {
          token: expirado,
          ordemServicoId: osId,
          emailCliente: 'cliente@e2e.test',
          expiresAt: new Date(Date.now() - UM_DIA),
        },
      });

      await request(app.getHttpServer())
        .get('/aprovacao/confirmar')
        .query({ token: expirado, acao: 'aprovar' })
        .expect(410);
    });
  });

  describe('POST /aprovacao/processar', () => {
    it('aprova: move para em_execucao, marca o token e registra o historico', async () => {
      const { osId, tokenAprovacao } = await osComTokenEmitido();

      await request(app.getHttpServer())
        .post('/aprovacao/processar')
        .query({ token: tokenAprovacao, acao: 'aprovar' })
        .expect(201);

      expect(await statusDaOs(osId)).toBe(Status.em_execucao);

      const registro = await prisma.tokenAprovacao.findUniqueOrThrow({
        where: { token: tokenAprovacao },
      });
      expect(registro.usedAt).not.toBeNull();

      const historico = await prisma.historicoStatusOrdemServico.findMany({
        where: { osId },
        orderBy: { criadoEm: 'asc' },
      });
      expect(historico.at(-1)?.statusNovo).toBe(Status.em_execucao);
    });

    it('rejeita: move para rejeitada', async () => {
      const { osId, tokenAprovacao } = await osComTokenEmitido();

      await request(app.getHttpServer())
        .post('/aprovacao/processar')
        .query({ token: tokenAprovacao, acao: 'rejeitar' })
        .expect(201);

      expect(await statusDaOs(osId)).toBe(Status.rejeitada);
    });

    it('token e de uso unico — a segunda tentativa da 410', async () => {
      const { osId, tokenAprovacao } = await osComTokenEmitido();

      await request(app.getHttpServer())
        .post('/aprovacao/processar')
        .query({ token: tokenAprovacao, acao: 'aprovar' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/aprovacao/processar')
        .query({ token: tokenAprovacao, acao: 'rejeitar' })
        .expect(410);

      // E o segundo clique nao pode reverter a decisao do primeiro.
      expect(await statusDaOs(osId)).toBe(Status.em_execucao);
    });

    it('recusa token expirado com 410 sem tocar na OS', async () => {
      const { osId } = await osComTokenEmitido();
      const expirado = randomUUID();
      await prisma.tokenAprovacao.create({
        data: {
          token: expirado,
          ordemServicoId: osId,
          emailCliente: 'cliente@e2e.test',
          expiresAt: new Date(Date.now() - UM_DIA),
        },
      });

      await request(app.getHttpServer())
        .post('/aprovacao/processar')
        .query({ token: expirado, acao: 'aprovar' })
        .expect(410);

      expect(await statusDaOs(osId)).toBe(Status.aguardando_aprovacao);
    });

    it('recusa quando a OS ja saiu de aguardando_aprovacao (409)', async () => {
      const { osId, tokenAprovacao } = await osComTokenEmitido();

      // A oficina tocou a OS por outro caminho enquanto o e-mail esperava.
      await prisma.ordemServico.update({
        where: { osId },
        data: { status: Status.em_execucao },
      });

      await request(app.getHttpServer())
        .post('/aprovacao/processar')
        .query({ token: tokenAprovacao, acao: 'aprovar' })
        .expect(409);
    });

    it('recusa token inexistente com 400', async () => {
      await request(app.getHttpServer())
        .post('/aprovacao/processar')
        .query({ token: randomUUID(), acao: 'aprovar' })
        .expect(400);
    });

    it('e publico — o cliente nao tem conta na oficina', async () => {
      const { tokenAprovacao } = await osComTokenEmitido();

      await request(app.getHttpServer())
        .post('/aprovacao/processar')
        .set('Authorization', 'Bearer lixo')
        .query({ token: tokenAprovacao, acao: 'aprovar' })
        .expect(201);
    });
  });
});
