import { Servico } from '../../domain/entities/servico.entity';
import { ServicoRepository } from '../../domain/repositories/servico.repository';
import { ListarServicosUseCase } from './listar-servicos.use-case';

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

describe('ListarServicosUseCase', () => {
  it('delega a listagem ao repositório', async () => {
    const repo = criarRepo(servicoPersistido());

    const resultado = await new ListarServicosUseCase(repo).executar();

    expect(resultado.map((x) => x.servicoId)).toEqual([42]);
    expect(repo.listar).toHaveBeenCalledTimes(1);
  });

  it('devolve lista vazia quando não há registros', async () => {
    await expect(
      new ListarServicosUseCase(criarRepo(null)).executar(),
    ).resolves.toEqual([]);
  });
});
