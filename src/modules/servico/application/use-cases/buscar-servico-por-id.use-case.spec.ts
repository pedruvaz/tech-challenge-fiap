import { Servico } from '../../domain/entities/servico.entity';
import { ServicoNaoEncontradoException } from '../../domain/exceptions/servico-nao-encontrado.exception';
import { ServicoRepository } from '../../domain/repositories/servico.repository';
import { BuscarServicoPorIdUseCase } from './buscar-servico-por-id.use-case';

const servicoPersistido = (servicoId = 42): Servico =>
  Servico.reconstituir({
    servicoId,
    descricao: 'Troca de óleo',
    valor: 120,
    criadoEm: new Date('2024-01-01T00:00:00Z'),
    atualizadoEm: new Date('2024-02-01T00:00:00Z'),
    deletadoEm: null,
  });

const criarRepo = (achado: Servico | null) =>
  ({
    salvar: jest.fn().mockImplementation((x: Servico) => Promise.resolve(x)),
    buscarPorId: jest.fn().mockResolvedValue(achado),
    listar: jest.fn().mockResolvedValue(achado ? [achado] : []),
  }) as unknown as ServicoRepository;

describe('BuscarServicoPorIdUseCase', () => {
  it('devolve o registro encontrado', async () => {
    const alvo = servicoPersistido();
    const repo = criarRepo(alvo);

    await expect(
      new BuscarServicoPorIdUseCase(repo).executar(42),
    ).resolves.toBe(alvo);
    expect(repo.buscarPorId).toHaveBeenCalledWith(42);
  });

  it('lança ServicoNaoEncontradoException quando não existe', async () => {
    await expect(
      new BuscarServicoPorIdUseCase(criarRepo(null)).executar(99),
    ).rejects.toThrow(ServicoNaoEncontradoException);
  });
});
