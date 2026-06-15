import { Test, TestingModule } from '@nestjs/testing';
import { InsumosService } from './insumos.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('InsumosService', () => {
  let service: InsumosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InsumosService, PrismaService],
    }).compile();

    service = module.get<InsumosService>(InsumosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
