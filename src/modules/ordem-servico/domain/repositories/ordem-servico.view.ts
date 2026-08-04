import type { StatusOSValor } from '../value-objects/status-os.vo';
import { FiltrosOrdemServico } from './ordem-servico.repository';

export type OrdemServicoView = {
  osId: string;
  usuarioId: number;
  clienteId: string;
  veiculoId: string;
  status: StatusOSValor;
  valorFinal: number;
  criadoEm: Date;
  atualizadoEm: Date;
  deletadoEm: Date | null;
  mecanico: { idUsuario: number; nome: string } | null;
  cliente: { clienteId: string; nome: string; numDocumento: string } | null;
  veiculo: {
    veiculoId: string;
    placa: string;
    marca: string;
    modelo: string;
  } | null;
  servicosRealizados: Array<{
    servicoId: number;
    descricao: string;
    quantidade: number;
    valor: number;
  }>;
  pecasUtilizadas: Array<{
    pecaId: number;
    nome: string;
    qtd: number;
    valor: number;
  }>;
  insumosConsumidos: Array<{
    insumoId: number;
    nome: string;
    qtdConsumida: number;
    valor: number;
  }>;
};

export abstract class OrdemServicoViewRepository {
  abstract buscarPorId(osId: string): Promise<OrdemServicoView | null>;
  abstract listar(filtros?: FiltrosOrdemServico): Promise<OrdemServicoView[]>;
}
