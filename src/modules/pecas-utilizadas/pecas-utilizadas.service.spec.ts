import { Test, TestingModule } from '@nestjs/testing';
import { PecasUtilizadasService } from './pecas-utilizadas.service';
import { PecasUtilizadasRepository } from './repositories/pecas-utilizadas.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('PecasUtilizadasService', () => {
  let service: PecasUtilizadasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PecasUtilizadasService,
        PecasUtilizadasRepository,
        PrismaService,
      ],
    }).compile();

    service = module.get<PecasUtilizadasService>(PecasUtilizadasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
