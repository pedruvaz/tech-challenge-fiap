import { Test, TestingModule } from '@nestjs/testing';
import { PecasRepository } from './pecas.repository';
import { PrismaService } from '../../../prisma/prisma.service';

describe('PecasRepository', () => {
  let provider: PecasRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PecasRepository, PrismaService],
    }).compile();

    provider = module.get<PecasRepository>(PecasRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
