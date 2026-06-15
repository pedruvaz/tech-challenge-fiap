import { Test, TestingModule } from '@nestjs/testing';
import { PecasUtilizadasRepository } from './pecas-utilizadas.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('PecasUtilizadasRepository', () => {
  let provider: PecasUtilizadasRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PecasUtilizadasRepository, PrismaService],
    }).compile();

    provider = module.get<PecasUtilizadasRepository>(PecasUtilizadasRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
