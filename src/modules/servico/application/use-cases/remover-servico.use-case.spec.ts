import { Servico } from '../../domain/entities/servico.entity';
import { ServicoNaoEncontradoException } from '../../domain/exceptions/servico-nao-encontrado.exception';
import { ServicoRepository } from '../../domain/repositories/servico.repository';
import { RemoverServicoUseCase } from './remover-servico.use-case';

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

describe('RemoverServicoUseCase', () => {
  it('faz soft delete e persiste', async () => {
    const alvo = servicoPersistido();
    const repo = criarRepo(alvo);

    await new RemoverServicoUseCase(repo).executar(42);

    expect(alvo.deletadoEm).toBeInstanceOf(Date);
    expect(repo.salvar).toHaveBeenCalledWith(alvo);
  });

  it('lança ServicoNaoEncontradoException e não salva', async () => {
    const repo = criarRepo(null);

    await expect(new RemoverServicoUseCase(repo).executar(99)).rejects.toThrow(
      ServicoNaoEncontradoException,
    );
    expect(repo.salvar).not.toHaveBeenCalled();
  });
});
