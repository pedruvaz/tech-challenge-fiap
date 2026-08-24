import { OrdemServicoView } from '../../domain/repositories/ordem-servico.view';
import { OrdemServicoResponseDto } from './dtos/ordem-servico.response';

export class OrdemServicoPresenter {
  static apresentar(view: OrdemServicoView): OrdemServicoResponseDto {
    const dto = new OrdemServicoResponseDto();
    dto.osId = view.osId;
    dto.usuarioId = view.usuarioId;
    dto.clienteId = view.clienteId;
    dto.veiculoId = view.veiculoId;
    dto.status = view.status;
    dto.valorFinal = view.valorFinal;
    dto.criadoEm = view.criadoEm;
    dto.atualizadoEm = view.atualizadoEm;
    dto.deletadoEm = view.deletadoEm;
    if (view.mecanico) dto.mecanico = view.mecanico;
    if (view.cliente) dto.cliente = view.cliente;
    if (view.veiculo) dto.veiculo = view.veiculo;
    dto.servicosRealizados = view.servicosRealizados;
    dto.pecasUtilizadas = view.pecasUtilizadas;
    dto.insumosConsumidos = view.insumosConsumidos;
    return dto;
  }

  static apresentarLista(views: OrdemServicoView[]): OrdemServicoResponseDto[] {
    return views.map((v) => OrdemServicoPresenter.apresentar(v));
  }
}
