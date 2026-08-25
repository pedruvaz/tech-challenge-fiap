import { Servico } from '../../domain/entities/servico.entity';
import { ServicoResponseDto } from './dtos/servico.response';

export class ServicoPresenter {
  static apresentar(servico: Servico): ServicoResponseDto {
    if (servico.servicoId === null) {
      throw new Error(
        'ServicoPresenter recebeu serviço sem id — invariante violada',
      );
    }
    const dto = new ServicoResponseDto();
    dto.servicoId = servico.servicoId;
    dto.descricao = servico.descricao;
    dto.valor = servico.valor;
    dto.criadoEm = servico.criadoEm;
    dto.atualizadoEm = servico.atualizadoEm;
    return dto;
  }

  static apresentarLista(servicos: Servico[]): ServicoResponseDto[] {
    return servicos.map((s) => ServicoPresenter.apresentar(s));
  }
}
