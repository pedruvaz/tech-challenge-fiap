import { Test, TestingModule } from '@nestjs/testing';
import { InsumosConsumidosRepository } from './insumos-consumidos.repository';
import { PrismaService } from '../../../prisma/prisma.service';

describe('InsumosConsumidosRepository', () => {
  let provider: InsumosConsumidosRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InsumosConsumidosRepository, PrismaService],
    }).compile();

    provider = module.get<InsumosConsumidosRepository>(
      InsumosConsumidosRepository,
    );
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
