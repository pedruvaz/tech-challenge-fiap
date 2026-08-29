import { INestApplication } from '@nestjs/common';
import { Status } from '@prisma/client';
import request from 'supertest';
import type { App } from 'supertest/types';
import { PrismaService } from '../../src/prisma/prisma.service';
import { criarAppDeTeste } from '../support/app';
import { Fixtures } from '../support/fixtures';
import { comToken, login } from '../support/http';

/**
 * O invariante "estoque nunca fica negativo" mora na entidade, e teste
 * unitario que mocka o repositorio nao prova que ele sobrevive ao caminho
 * HTTP -> use case -> unit of work -> Postgres. E o que esta suite faz.
 */
describe('Estoque na OS (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let fixtures: Fixtures;
  let token: string;
  let osId: string;

  const estoqueDaPeca = async (pecaId: number): Promise<number> => {
    const peca = await prisma.peca.findUniqueOrThrow({ where: { pecaId } });
    return peca.qtdEstoque;
  };

  const estoqueDoInsumo = async (insumoId: number): Promise<number> => {
    const insumo = await prisma.insumo.findUniqueOrThrow({
      where: { insumoId },
    });
    return insumo.qtdEstoque;
  };

  beforeAll(async () => {
    ({ app, prisma } = await criarAppDeTeste());
    fixtures = new Fixtures(prisma);

    const cenario = await fixtures.cenarioBase();
    osId = cenario.osId;
    ({ accessToken: token } = await login(app, cenario.email, cenario.senha));
  });

  afterAll(async () => {
    await fixtures.limpar();
    await app.close();
  });

  describe('pecas', () => {
    it('adicionar peca decrementa o estoque pela quantidade usada', async () => {
      const pecaId = await fixtures.criarPeca(10);

      await request(app.getHttpServer())
        .post(`/ordens-servico/${osId}/pecas`)
        .set('Authorization', comToken(token))
        .send({ pecaId, qtd: 3 })
        .expect(201);

      expect(await estoqueDaPeca(pecaId)).toBe(7);
    });

    it('ajusta pelo delta ao mudar a quantidade, nao subtrai de novo', async () => {
      const pecaId = await fixtures.criarPeca(10);

      await request(app.getHttpServer())
        .post(`/ordens-servico/${osId}/pecas`)
        .set('Authorization', comToken(token))
        .send({ pecaId, qtd: 2 })
        .expect(201);
      expect(await estoqueDaPeca(pecaId)).toBe(8);

      // De 2 para 5 deve consumir mais 3 — nao mais 5.
      await request(app.getHttpServer())
        .post(`/ordens-servico/${osId}/pecas`)
        .set('Authorization', comToken(token))
        .send({ pecaId, qtd: 5 })
        .expect(201);
      expect(await estoqueDaPeca(pecaId)).toBe(5);

      // E baixar a quantidade devolve a diferenca.
      await request(app.getHttpServer())
        .post(`/ordens-servico/${osId}/pecas`)
        .set('Authorization', comToken(token))
        .send({ pecaId, qtd: 1 })
        .expect(201);
      expect(await estoqueDaPeca(pecaId)).toBe(9);
    });

    it('recusa quantidade maior que o estoque com 400 e nao move o saldo', async () => {
      const pecaId = await fixtures.criarPeca(2);

      await request(app.getHttpServer())
        .post(`/ordens-servico/${osId}/pecas`)
        .set('Authorization', comToken(token))
        .send({ pecaId, qtd: 3 })
        .expect(400);

      expect(await estoqueDaPeca(pecaId)).toBe(2);
    });

    it('remover peca devolve a quantidade ao estoque', async () => {
      const pecaId = await fixtures.criarPeca(10);

      await request(app.getHttpServer())
        .post(`/ordens-servico/${osId}/pecas`)
        .set('Authorization', comToken(token))
        .send({ pecaId, qtd: 4 })
        .expect(201);
      expect(await estoqueDaPeca(pecaId)).toBe(6);

      await request(app.getHttpServer())
        .delete(`/ordens-servico/${osId}/pecas/${pecaId}`)
        .set('Authorization', comToken(token))
        .expect(200);

      expect(await estoqueDaPeca(pecaId)).toBe(10);
    });

    it('rejeita qtd zero ou negativa antes de encostar no estoque', async () => {
      const pecaId = await fixtures.criarPeca(5);

      await request(app.getHttpServer())
        .post(`/ordens-servico/${osId}/pecas`)
        .set('Authorization', comToken(token))
        .send({ pecaId, qtd: 0 })
        .expect(400);

      expect(await estoqueDaPeca(pecaId)).toBe(5);
    });

    it('exige autenticacao', async () => {
      const pecaId = await fixtures.criarPeca(5);

      await request(app.getHttpServer())
        .post(`/ordens-servico/${osId}/pecas`)
        .send({ pecaId, qtd: 1 })
        .expect(401);

      expect(await estoqueDaPeca(pecaId)).toBe(5);
    });
  });

  describe('insumos', () => {
    it('adicionar insumo decrementa o estoque', async () => {
      const insumoId = await fixtures.criarInsumo(10);

      await request(app.getHttpServer())
        .post(`/ordens-servico/${osId}/insumos`)
        .set('Authorization', comToken(token))
        .send({ insumoId, qtdConsumida: 4 })
        .expect(201);

      expect(await estoqueDoInsumo(insumoId)).toBe(6);
    });

    it('recusa consumo acima do estoque e mantem o saldo', async () => {
      const insumoId = await fixtures.criarInsumo(1);

      await request(app.getHttpServer())
        .post(`/ordens-servico/${osId}/insumos`)
        .set('Authorization', comToken(token))
        .send({ insumoId, qtdConsumida: 2 })
        .expect(400);

      expect(await estoqueDoInsumo(insumoId)).toBe(1);
    });

    it('remover insumo devolve ao estoque', async () => {
      const insumoId = await fixtures.criarInsumo(8);

      await request(app.getHttpServer())
        .post(`/ordens-servico/${osId}/insumos`)
        .set('Authorization', comToken(token))
        .send({ insumoId, qtdConsumida: 3 })
        .expect(201);
      expect(await estoqueDoInsumo(insumoId)).toBe(5);

      await request(app.getHttpServer())
        .delete(`/ordens-servico/${osId}/insumos/${insumoId}`)
        .set('Authorization', comToken(token))
        .expect(200);

      expect(await estoqueDoInsumo(insumoId)).toBe(8);
    });
  });

  describe('OS que nao aceita mais edicao', () => {
    it('nao consome estoque ao tentar adicionar peca em OS finalizada', async () => {
      const cenario = await fixtures.cenarioBase(Status.finalizada);
      const pecaId = await fixtures.criarPeca(5);

      await request(app.getHttpServer())
        .post(`/ordens-servico/${cenario.osId}/pecas`)
        .set('Authorization', comToken(token))
        .send({ pecaId, qtd: 2 })
        .expect(400);

      // O use case ajusta o estoque em memoria antes de pedir a edicao a OS.
      // Se a ordem das operacoes mudar e o save escapar, o estoque some sem
      // a peca nunca ter sido aplicada — e este teste que pega isso.
      expect(await estoqueDaPeca(pecaId)).toBe(5);
    });
  });
});
