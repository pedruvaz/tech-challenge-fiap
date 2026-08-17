import { Servico } from '../../domain/entities/servico.entity';
import { ServicoRepository } from '../../domain/repositories/servico.repository';

export type CriarServicoInput = {
  descricao: string;
  valor: number;
};

export class CriarServicoUseCase {
  constructor(private readonly repo: ServicoRepository) {}

  async executar(input: CriarServicoInput): Promise<Servico> {
    const servico = Servico.criar(input);
    return this.repo.salvar(servico);
  }
}
