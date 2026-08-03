import { OrdemServicoRepository } from '../../domain/repositories/ordem-servico.repository';

export type TempoMedioExecucaoOutput = {
  tempoMedioMs: number;
  tempoMedioMinutos: number;
  tempoMedioHoras: number;
};

export class CalcularTempoMedioExecucaoUseCase {
  constructor(private readonly osRepo: OrdemServicoRepository) {}

  async executar(): Promise<TempoMedioExecucaoOutput> {
    const tempoMedioMs = await this.osRepo.tempoMedioExecucaoMs();
    return {
      tempoMedioMs,
      tempoMedioMinutos: tempoMedioMs / 60000,
      tempoMedioHoras: tempoMedioMs / 3600000,
    };
  }
}
