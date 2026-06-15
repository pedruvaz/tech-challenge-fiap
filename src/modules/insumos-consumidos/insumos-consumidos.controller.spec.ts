import { Test, TestingModule } from '@nestjs/testing';
import { InsumosConsumidosController } from './insumos-consumidos.controller';
import { InsumosConsumidosService } from './insumos-consumidos.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('InsumosConsumidosController', () => {
  let controller: InsumosConsumidosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsumosConsumidosController],
      providers: [InsumosConsumidosService, PrismaService],
    }).compile();

    controller = module.get<InsumosConsumidosController>(InsumosConsumidosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
