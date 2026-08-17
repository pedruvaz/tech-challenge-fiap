import { Servico } from '../../domain/entities/servico.entity';
import { ServicoInvalidoException } from '../../domain/exceptions/servico-invalido.exception';
import { ServicoRepository } from '../../domain/repositories/servico.repository';
import { CriarServicoUseCase } from './criar-servico.use-case';

class RepoFake implements ServicoRepository {
  servicos: Servico[] = [];
  private nextId = 1;

  salvar = jest.fn((s: Servico): Promise<Servico> => {
    const reconstituido = Servico.reconstituir({
      servicoId: this.nextId++,
      descricao: s.descricao,
      valor: s.valor,
      criadoEm: s.criadoEm,
      atualizadoEm: s.atualizadoEm,
      deletadoEm: s.deletadoEm,
    });
    this.servicos.push(reconstituido);
    return Promise.resolve(reconstituido);
  });
  buscarPorId = jest.fn(
    (id: number): Promise<Servico | null> =>
      Promise.resolve(this.servicos.find((s) => s.servicoId === id) ?? null),
  );
  listar = jest.fn((): Promise<Servico[]> => Promise.resolve(this.servicos));
}

describe('CriarServicoUseCase', () => {
  it('cria serviço válido', async () => {
    const repo = new RepoFake();
    const uc = new CriarServicoUseCase(repo);
    const servico = await uc.executar({
      descricao: 'Troca de óleo',
      valor: 100,
    });
    expect(servico.descricao).toBe('Troca de óleo');
    expect(repo.salvar).toHaveBeenCalledTimes(1);
  });

  it('rejeita descrição curta demais', async () => {
    const repo = new RepoFake();
    const uc = new CriarServicoUseCase(repo);
    await expect(
      uc.executar({ descricao: 'A', valor: 1 }),
    ).rejects.toBeInstanceOf(ServicoInvalidoException);
  });

  it('rejeita valor negativo', async () => {
    const repo = new RepoFake();
    const uc = new CriarServicoUseCase(repo);
    await expect(
      uc.executar({ descricao: 'Troca de óleo', valor: -1 }),
    ).rejects.toBeInstanceOf(ServicoInvalidoException);
  });
});
