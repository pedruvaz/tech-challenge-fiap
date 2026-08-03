import { OrdemServico } from '../entities/ordem-servico.entity';
import { StatusOSValor } from '../value-objects/status-os.vo';

export type FiltrosOrdemServico = {
  status?: StatusOSValor;
  clienteId?: string;
};

export abstract class OrdemServicoRepository {
  abstract salvar(os: OrdemServico): Promise<void>;
  abstract buscarPorId(osId: string): Promise<OrdemServico | null>;
  abstract listar(filtros?: FiltrosOrdemServico): Promise<OrdemServico[]>;
  abstract tempoMedioExecucaoMs(): Promise<number>;
}
