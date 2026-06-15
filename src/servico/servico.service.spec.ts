import { Test, TestingModule } from '@nestjs/testing';
import { ServicoService } from './servico.service';
import { ServicoRepository } from './repositories/servico.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('ServicoService', () => {
  let service: ServicoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicoService, ServicoRepository, PrismaService],
    }).compile();

    service = module.get<ServicoService>(ServicoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
