import { Test, TestingModule } from '@nestjs/testing';
import { ServicosRealizadosController } from './servicos-realizados.controller';
import { ServicosRealizadosService } from './servicos-realizados.service';
import { ServicosRealizadosRepository } from './repositories/servicos-realizados.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('ServicosRealizadosController', () => {
  let controller: ServicosRealizadosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicosRealizadosController],
      providers: [ServicosRealizadosService, ServicosRealizadosRepository, PrismaService],
    }).compile();

    controller = module.get<ServicosRealizadosController>(ServicosRealizadosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
