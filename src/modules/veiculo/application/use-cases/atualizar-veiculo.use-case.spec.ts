import { Veiculo } from '../../domain/entities/veiculo.entity';
import { PlacaJaCadastradaException } from '../../domain/exceptions/placa-ja-cadastrada.exception';
import { VeiculoNaoEncontradoException } from '../../domain/exceptions/veiculo-nao-encontrado.exception';
import { VeiculoRepository } from '../../domain/repositories/veiculo.repository';
import { AtualizarVeiculoUseCase } from './atualizar-veiculo.use-case';

const veiculoExistente = (): Veiculo =>
  Veiculo.criar({
    veiculoId: 'v1',
    placa: 'ABC1D23',
    marca: 'Toyota',
    modelo: 'Corolla',
    ano: '2020',
    cor: 'Preto',
    clienteProprietarioId: 'c1',
  });

type RepoOpts = { veiculo?: Veiculo | null; conflito?: boolean };

const criarRepo = ({ veiculo = null, conflito = false }: RepoOpts) =>
  ({
    salvar: jest.fn().mockResolvedValue(undefined),
    buscarPorId: jest.fn().mockResolvedValue(veiculo),
    listar: jest.fn(),
    existeComPlaca: jest.fn().mockResolvedValue(conflito),
  }) as unknown as VeiculoRepository;

describe('AtualizarVeiculoUseCase', () => {
  it('lança VeiculoNaoEncontradoException quando o veículo não existe', async () => {
    const repo = criarRepo({ veiculo: null });

    await expect(
      new AtualizarVeiculoUseCase(repo).executar({ veiculoId: 'x' }),
    ).rejects.toThrow(VeiculoNaoEncontradoException);
    expect(repo.salvar).not.toHaveBeenCalled();
  });

  it('rejeita quando a nova placa já pertence a outro veículo', async () => {
    const repo = criarRepo({ veiculo: veiculoExistente(), conflito: true });

    await expect(
      new AtualizarVeiculoUseCase(repo).executar({
        veiculoId: 'v1',
        placa: 'XYZ4321',
      }),
    ).rejects.toThrow(PlacaJaCadastradaException);
    // O próprio veículo é ignorado na checagem de unicidade.
    expect(repo.existeComPlaca).toHaveBeenCalledWith('XYZ4321', 'v1');
    expect(repo.salvar).not.toHaveBeenCalled();
  });

  it('não checa unicidade quando a placa não é alterada', async () => {
    const repo = criarRepo({ veiculo: veiculoExistente() });

    await new AtualizarVeiculoUseCase(repo).executar({
      veiculoId: 'v1',
      cor: 'Vermelho',
    });

    expect(repo.existeComPlaca).not.toHaveBeenCalled();
    expect(repo.salvar).toHaveBeenCalledTimes(1);
  });

  it('aplica as alterações e persiste', async () => {
    const veiculo = veiculoExistente();
    const repo = criarRepo({ veiculo });

    await new AtualizarVeiculoUseCase(repo).executar({
      veiculoId: 'v1',
      placa: 'XYZ4321',
      marca: 'Honda',
      modelo: 'Civic',
      ano: '2022',
      cor: 'Prata',
    });

    expect(veiculo.placa.valor).toBe('XYZ4321');
    expect(veiculo.marca).toBe('Honda');
    expect(veiculo.modelo).toBe('Civic');
    expect(veiculo.ano).toBe('2022');
    expect(veiculo.cor).toBe('Prata');
    expect(repo.salvar).toHaveBeenCalledWith(veiculo);
  });

  it('devolve a releitura do repositório após salvar', async () => {
    const veiculo = veiculoExistente();
    const releitura = veiculoExistente();
    const repo = {
      salvar: jest.fn().mockResolvedValue(undefined),
      buscarPorId: jest
        .fn()
        .mockResolvedValueOnce(veiculo)
        .mockResolvedValueOnce(releitura),
      listar: jest.fn(),
      existeComPlaca: jest.fn().mockResolvedValue(false),
    } as unknown as VeiculoRepository;

    const resultado = await new AtualizarVeiculoUseCase(repo).executar({
      veiculoId: 'v1',
      cor: 'Azul',
    });

    expect(resultado).toBe(releitura);
  });

  it('cai de volta na instância em memória quando a releitura vem vazia', async () => {
    const veiculo = veiculoExistente();
    const repo = {
      salvar: jest.fn().mockResolvedValue(undefined),
      buscarPorId: jest
        .fn()
        .mockResolvedValueOnce(veiculo)
        .mockResolvedValueOnce(null),
      listar: jest.fn(),
      existeComPlaca: jest.fn().mockResolvedValue(false),
    } as unknown as VeiculoRepository;

    const resultado = await new AtualizarVeiculoUseCase(repo).executar({
      veiculoId: 'v1',
      cor: 'Azul',
    });

    expect(resultado).toBe(veiculo);
  });
});
