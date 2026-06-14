import { Test, TestingModule } from '@nestjs/testing';
import { PecasService } from './pecas.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PecasService', () => {
  let service: PecasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PecasService, PrismaService],
    }).compile();

    service = module.get<PecasService>(PecasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
