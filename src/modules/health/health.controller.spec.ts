import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../../prisma/prisma.service';
import { HealthController } from './health.controller';

type Indicador = () => Promise<unknown>;

function montar() {
  let registrados: Indicador[] = [];
  const health = {
    check: jest.fn((indicadores: Indicador[]) => {
      registrados = indicadores;
      return Promise.resolve({ status: 'ok' });
    }),
  };
  const prismaIndicator = {
    pingCheck: jest.fn().mockResolvedValue({ prisma: { status: 'up' } }),
  };
  const prisma = {} as PrismaService;

  const controller = new HealthController(
    health as unknown as HealthCheckService,
    prismaIndicator as unknown as PrismaHealthIndicator,
    prisma,
  );

  return {
    controller,
    health,
    prismaIndicator,
    prisma,
    indicadores: () => registrados,
  };
}

describe('HealthController', () => {
  describe('GET /health/liveness', () => {
    it('não checa dependência nenhuma — só responde que o processo está de pé', async () => {
      const { controller, health } = montar();

      await expect(controller.liveness()).resolves.toEqual({ status: 'ok' });
      expect(health.check).toHaveBeenCalledWith([]);
    });
  });

  describe('GET /health/readiness', () => {
    it('registra um ping no Prisma como indicador', async () => {
      const { controller, health, indicadores } = montar();

      await controller.readiness();

      expect(health.check).toHaveBeenCalledTimes(1);
      expect(indicadores()).toHaveLength(1);
    });

    it('o indicador registrado pinga o Prisma com o nome "prisma"', async () => {
      const { controller, prismaIndicator, prisma, indicadores } = montar();

      await controller.readiness();
      await indicadores()[0]();

      expect(prismaIndicator.pingCheck).toHaveBeenCalledWith('prisma', prisma);
    });
  });
});
