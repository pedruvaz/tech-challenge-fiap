import { Test, TestingModule } from '@nestjs/testing';
import { ServicoRepository } from './servico.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('ServicoRepository', () => {
  let provider: ServicoRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicoRepository, PrismaService],
    }).compile();

    provider = module.get<ServicoRepository>(ServicoRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
