import { CalcularTempoMedioExecucaoUseCase } from './calcular-tempo-medio-execucao.use-case';
import { OsRepoFake } from './fakes.spec-helper';

describe('CalcularTempoMedioExecucaoUseCase', () => {
  it('converte o tempo médio em ms para minutos e horas', async () => {
    const repo = new OsRepoFake(null);
    repo.tempoMedioExecucaoMs.mockResolvedValue(5_400_000); // 1h30

    const resultado = await new CalcularTempoMedioExecucaoUseCase(
      repo,
    ).executar();

    expect(resultado).toEqual({
      tempoMedioMs: 5_400_000,
      tempoMedioMinutos: 90,
      tempoMedioHoras: 1.5,
    });
  });

  it('devolve zeros quando não há OS finalizada', async () => {
    const repo = new OsRepoFake(null);
    repo.tempoMedioExecucaoMs.mockResolvedValue(0);

    await expect(
      new CalcularTempoMedioExecucaoUseCase(repo).executar(),
    ).resolves.toEqual({
      tempoMedioMs: 0,
      tempoMedioMinutos: 0,
      tempoMedioHoras: 0,
    });
  });
});
