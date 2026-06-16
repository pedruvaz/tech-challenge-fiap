import { Test, TestingModule } from '@nestjs/testing';
import { ServicosRealizadosService } from './servicos-realizados.service';
import { ServicosRealizadosRepository } from './repositories/servicos-realizados.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('ServicosRealizadosService', () => {
  let service: ServicosRealizadosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicosRealizadosService,
        ServicosRealizadosRepository,
        PrismaService,
      ],
    }).compile();

    service = module.get<ServicosRealizadosService>(ServicosRealizadosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
