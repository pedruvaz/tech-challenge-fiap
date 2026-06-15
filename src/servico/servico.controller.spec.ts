import { Test, TestingModule } from '@nestjs/testing';
import { ServicoController } from './servico.controller';
import { ServicoService } from './servico.service';
import { ServicoRepository } from './repositories/servico.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('ServicoController', () => {
  let controller: ServicoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicoController],
      providers: [ServicoService, ServicoRepository, PrismaService],
    }).compile();

    controller = module.get<ServicoController>(ServicoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
