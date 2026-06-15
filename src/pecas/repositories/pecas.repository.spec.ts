import { Test, TestingModule } from '@nestjs/testing';
import { PecasRepository } from './pecas.repository';

describe('PecasRepository', () => {
  let provider: PecasRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PecasRepository],
    }).compile();

    provider = module.get<PecasRepository>(PecasRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
