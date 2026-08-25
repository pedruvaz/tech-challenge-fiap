import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UnitOfWork } from '../../domain/repositories/unit-of-work';

export type PrismaClientLike = PrismaService | Prisma.TransactionClient;

@Injectable()
export class PrismaTransactionContext extends UnitOfWork {
  private readonly als = new AsyncLocalStorage<Prisma.TransactionClient>();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  cliente(): PrismaClientLike {
    return this.als.getStore() ?? this.prisma;
  }

  async executar<T>(trabalho: () => Promise<T>): Promise<T> {
    if (this.als.getStore()) {
      return trabalho();
    }
    return this.prisma.$transaction((tx) =>
      this.als.run(tx, () => trabalho()),
    );
  }
}
