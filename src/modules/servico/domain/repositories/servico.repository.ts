import { Servico } from '../entities/servico.entity';

export abstract class ServicoRepository {
  abstract salvar(servico: Servico): Promise<Servico>;
  abstract buscarPorId(servicoId: number): Promise<Servico | null>;
  abstract listar(): Promise<Servico[]>;
}
