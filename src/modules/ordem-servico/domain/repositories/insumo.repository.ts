import { Insumo } from '../entities/insumo.entity';

export abstract class InsumoRepository {
  abstract buscarPorId(insumoId: number): Promise<Insumo | null>;
  abstract salvar(insumo: Insumo): Promise<void>;
}
