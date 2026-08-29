import { PrismaService } from '../../../../prisma/prisma.service';
import { PrismaTransactionContext } from './prisma-transaction-context';

function montar() {
  const tx = { marcador: 'tx' };
  const prisma = {
    marcador: 'raiz',
    $transaction: jest.fn(
      (fn: (t: unknown) => Promise<unknown>): Promise<unknown> => fn(tx),
    ),
  };

  return {
    ctx: new PrismaTransactionContext(prisma as unknown as PrismaService),
    prisma,
    tx,
  };
}

describe('PrismaTransactionContext', () => {
  describe('cliente', () => {
    it('devolve o PrismaService quando não há transação em curso', () => {
      const { ctx, prisma } = montar();

      expect(ctx.cliente()).toBe(prisma);
    });

    it('devolve o client transacional dentro de executar', async () => {
      const { ctx, tx } = montar();

      await ctx.executar(() => {
        expect(ctx.cliente()).toBe(tx);
        return Promise.resolve();
      });
    });
  });

  describe('executar', () => {
    it('abre uma transação quando ainda não há uma', async () => {
      const { ctx, prisma } = montar();

      await expect(ctx.executar(() => Promise.resolve('ok'))).resolves.toBe(
        'ok',
      );
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('reaproveita a transação em curso em vez de aninhar outra', async () => {
      const { ctx, prisma, tx } = montar();

      await ctx.executar(async () => {
        await ctx.executar(() => {
          expect(ctx.cliente()).toBe(tx);
          return Promise.resolve();
        });
      });

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('propaga o erro do trabalho para quem chamou', async () => {
      const { ctx } = montar();

      await expect(
        ctx.executar(() => Promise.reject(new Error('falhou'))),
      ).rejects.toThrow('falhou');
    });

    it('volta ao client raiz depois que a transação termina', async () => {
      const { ctx, prisma } = montar();

      await ctx.executar(() => Promise.resolve());

      expect(ctx.cliente()).toBe(prisma);
    });
  });
});
