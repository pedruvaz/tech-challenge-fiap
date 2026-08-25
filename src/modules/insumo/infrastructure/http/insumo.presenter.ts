import { Insumo } from '../../domain/entities/insumo.entity';
import { InsumoResponseDto } from './dtos/insumo.response';

export class InsumoPresenter {
  static apresentar(insumo: Insumo): InsumoResponseDto {
    if (insumo.insumoId === null) {
      throw new Error(
        'InsumoPresenter recebeu insumo sem id — invariante violada',
      );
    }
    const dto = new InsumoResponseDto();
    dto.insumoId = insumo.insumoId;
    dto.nome = insumo.nome;
    dto.qtdEstoque = insumo.qtdEstoque;
    dto.valorUn = insumo.valorUn;
    dto.criadoEm = insumo.criadoEm;
    dto.atualizadoEm = insumo.atualizadoEm;
    return dto;
  }

  static apresentarLista(insumos: Insumo[]): InsumoResponseDto[] {
    return insumos.map((i) => InsumoPresenter.apresentar(i));
  }
}
