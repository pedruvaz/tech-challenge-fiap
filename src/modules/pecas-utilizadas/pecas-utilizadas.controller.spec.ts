import { Test, TestingModule } from '@nestjs/testing';
import { PecasUtilizadasController } from './pecas-utilizadas.controller';
import { PecasUtilizadasService } from './pecas-utilizadas.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PecasUtilizadasRepository } from './repositories/pecas-utilizadas.repository';

describe('PecasUtilizadasController', () => {
  let controller: PecasUtilizadasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PecasUtilizadasController],
      providers: [
        PecasUtilizadasService,
        PrismaService,
        PecasUtilizadasRepository,
      ],
    }).compile();

    controller = module.get<PecasUtilizadasController>(
      PecasUtilizadasController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
