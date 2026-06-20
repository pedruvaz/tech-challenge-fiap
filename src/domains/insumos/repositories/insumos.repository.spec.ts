import { Test, TestingModule } from '@nestjs/testing';
import { InsumosRepository } from './insumos.repository';
import { PrismaService } from '../../../prisma/prisma.service';

describe('InsumosRepository', () => {
  let provider: InsumosRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InsumosRepository, PrismaService],
    }).compile();

    provider = module.get<InsumosRepository>(InsumosRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
