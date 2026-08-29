import { Servico } from '../../domain/entities/servico.entity';
import { ServicoNaoEncontradoException } from '../../domain/exceptions/servico-nao-encontrado.exception';
import { ServicoRepository } from '../../domain/repositories/servico.repository';
import { AtualizarServicoUseCase } from './atualizar-servico.use-case';

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

describe('AtualizarServicoUseCase', () => {
  it('lança ServicoNaoEncontradoException quando não existe', async () => {
    const repo = criarRepo(null);

    await expect(
      new AtualizarServicoUseCase(repo).executar({ servicoId: 99 }),
    ).rejects.toThrow(ServicoNaoEncontradoException);
    expect(repo.salvar).not.toHaveBeenCalled();
  });

  it('aplica a alteração e devolve o resultado do repositório', async () => {
    const alvo = servicoPersistido();
    const repo = criarRepo(alvo);

    const resultado = await new AtualizarServicoUseCase(repo).executar({
      servicoId: 42,
      ...{ valor: 90 },
    });

    expect(alvo.valor).toBe(90);
    expect(resultado).toBe(alvo);
    expect(repo.salvar).toHaveBeenCalledWith(alvo);
  });

  it('mantém os campos não informados', async () => {
    const alvo = servicoPersistido();
    const repo = criarRepo(alvo);

    await new AtualizarServicoUseCase(repo).executar({ servicoId: 42 });

    expect(alvo.descricao).toBe('Troca de óleo');
  });
});
