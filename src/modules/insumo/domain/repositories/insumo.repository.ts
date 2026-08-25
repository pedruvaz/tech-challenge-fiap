import { Insumo } from '../entities/insumo.entity';

export abstract class InsumoRepository {
  abstract salvar(insumo: Insumo): Promise<Insumo>;
  abstract buscarPorId(insumoId: number): Promise<Insumo | null>;
  abstract listar(): Promise<Insumo[]>;
}
