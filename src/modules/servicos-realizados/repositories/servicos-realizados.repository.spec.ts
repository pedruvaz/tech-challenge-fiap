import { Test, TestingModule } from '@nestjs/testing';
import { ServicosRealizadosRepository } from './servicos-realizados.repository';
import { PrismaService } from '../../../prisma/prisma.service';

describe('ServicosRealizadosRepository', () => {
  let provider: ServicosRealizadosRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicosRealizadosRepository, PrismaService],
    }).compile();

    provider = module.get<ServicosRealizadosRepository>(
      ServicosRealizadosRepository,
    );
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
