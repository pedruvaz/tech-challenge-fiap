import { Servico } from '../entities/servico.entity';

export abstract class ServicoRepository {
  abstract buscarPorId(servicoId: number): Promise<Servico | null>;
}
