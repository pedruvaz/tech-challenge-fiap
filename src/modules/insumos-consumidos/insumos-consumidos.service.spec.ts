import { Test, TestingModule } from '@nestjs/testing';
import { InsumosConsumidosService } from './insumos-consumidos.service';
import { PrismaService } from '../../prisma/prisma.service';
import { InsumosConsumidosRepository } from './repositories/insumos-consumidos.repository';

describe('InsumosConsumidosService', () => {
  let service: InsumosConsumidosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InsumosConsumidosService, PrismaService, InsumosConsumidosRepository],
    }).compile();

    service = module.get<InsumosConsumidosService>(InsumosConsumidosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
