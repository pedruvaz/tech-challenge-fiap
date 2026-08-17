import { Peca } from '../../domain/entities/peca.entity';
import { PecaResponseDto } from './dtos/peca.response';

export class PecaPresenter {
  static apresentar(peca: Peca): PecaResponseDto {
    if (peca.pecaId === null) {
      throw new Error('PecaPresenter recebeu peça sem id — invariante violada');
    }
    const dto = new PecaResponseDto();
    dto.pecaId = peca.pecaId;
    dto.nome = peca.nome;
    dto.qtdEstoque = peca.qtdEstoque;
    dto.valorUn = peca.valorUn;
    dto.criadoEm = peca.criadoEm;
    dto.atualizadoEm = peca.atualizadoEm;
    return dto;
  }

  static apresentarLista(pecas: Peca[]): PecaResponseDto[] {
    return pecas.map((p) => PecaPresenter.apresentar(p));
  }
}
