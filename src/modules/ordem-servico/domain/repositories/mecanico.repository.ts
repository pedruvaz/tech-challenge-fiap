import { Mecanico } from '../entities/mecanico.entity';

export abstract class MecanicoRepository {
  abstract buscarPorId(id: number): Promise<Mecanico | null>;
}
