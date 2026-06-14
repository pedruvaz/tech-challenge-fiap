import { Test, TestingModule } from '@nestjs/testing';
import { InsumosController } from './insumos.controller';
import { InsumosService } from './insumos.service';
import { PrismaService } from '../prisma/prisma.service';

describe('InsumosController', () => {
  let controller: InsumosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsumosController],
      providers: [InsumosService, PrismaService],
    }).compile();

    controller = module.get<InsumosController>(InsumosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
