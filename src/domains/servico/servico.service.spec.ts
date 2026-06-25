import { Test, TestingModule } from '@nestjs/testing';
import { ServicoService } from './servico.service';
import { ServicoRepository } from './repositories/servico.repository';

describe('ServicoService', () => {
  let service: ServicoService;

  const servicoMock = {
    servicoId: 1,
    descricao: 'Troca de óleo',
    valor: 150.0,
  };

  const repositoryMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicoService,
        { provide: ServicoRepository, useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<ServicoService>(ServicoService);
  });

  describe('create', () => {
    it('deve criar um serviço', async () => {
      repositoryMock.create.mockResolvedValue(servicoMock);

      const resultado = await service.create({
        descricao: servicoMock.descricao,
        valor: servicoMock.valor,
      });

      expect(repositoryMock.create).toHaveBeenCalled();
      expect(resultado.descricao).toBe(servicoMock.descricao);
    });
  });

  describe('findAll', () => {
    it('deve retornar a lista de serviços', async () => {
      repositoryMock.findAll.mockResolvedValue([servicoMock]);

      const resultado = await service.findAll();

      expect(resultado).toHaveLength(1);
      expect(resultado[0].servicoId).toBe(servicoMock.servicoId);
    });
  });

  describe('findOne', () => {
    it('deve retornar um serviço pelo id', async () => {
      repositoryMock.findOne.mockResolvedValue(servicoMock);

      const resultado = await service.findOne(1);

      expect(repositoryMock.findOne).toHaveBeenCalledWith(1);
      expect(resultado.servicoId).toBe(1);
    });

    it('deve propagar erro quando o serviço não existir', async () => {
      repositoryMock.findOne.mockRejectedValue(
        new Error('Serviço não encontrado.'),
      );

      await expect(service.findOne(999)).rejects.toThrow(
        'Serviço não encontrado.',
      );
    });
  });

  describe('update', () => {
    it('deve atualizar um serviço', async () => {
      const atualizado = { ...servicoMock, descricao: 'Alinhamento' };
      repositoryMock.update.mockResolvedValue(atualizado);

      const resultado = await service.update(1, { descricao: 'Alinhamento' });

      expect(repositoryMock.update).toHaveBeenCalledWith(1, {
        descricao: 'Alinhamento',
      });
      expect(resultado.descricao).toBe('Alinhamento');
    });
  });

  describe('remove', () => {
    it('deve remover um serviço', async () => {
      repositoryMock.remove.mockResolvedValue(servicoMock);

      const resultado = await service.remove(1);

      expect(repositoryMock.remove).toHaveBeenCalledWith(1);
      expect(resultado).toEqual(servicoMock);
    });
  });
});
