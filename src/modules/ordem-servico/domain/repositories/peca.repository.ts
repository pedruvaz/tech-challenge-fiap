import { Peca } from '../entities/peca.entity';

export abstract class PecaRepository {
  abstract buscarPorId(pecaId: number): Promise<Peca | null>;
  abstract salvar(peca: Peca): Promise<void>;
}
