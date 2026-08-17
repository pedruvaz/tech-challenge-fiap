import { Peca } from '../entities/peca.entity';

export abstract class PecaRepository {
  abstract salvar(peca: Peca): Promise<Peca>;
  abstract buscarPorId(pecaId: number): Promise<Peca | null>;
  abstract listar(): Promise<Peca[]>;
}
