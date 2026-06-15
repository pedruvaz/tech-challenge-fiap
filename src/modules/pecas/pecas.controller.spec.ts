import { Test, TestingModule } from '@nestjs/testing';
import { PecasController } from './pecas.controller';
import { PecasService } from './pecas.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PecasRepository } from './repositories/pecas.repository';

describe('PecasController', () => {
  let controller: PecasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PecasController],
      providers: [PecasService, PrismaService, PecasRepository],
    }).compile();

    controller = module.get<PecasController>(PecasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
