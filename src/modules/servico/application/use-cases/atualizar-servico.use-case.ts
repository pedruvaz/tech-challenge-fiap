import { Servico } from '../../domain/entities/servico.entity';
import { ServicoNaoEncontradoException } from '../../domain/exceptions/servico-nao-encontrado.exception';
import { ServicoRepository } from '../../domain/repositories/servico.repository';

export type AtualizarServicoInput = {
  servicoId: number;
  descricao?: string;
  valor?: number;
};

export class AtualizarServicoUseCase {
  constructor(private readonly repo: ServicoRepository) {}

  async executar(input: AtualizarServicoInput): Promise<Servico> {
    const servico = await this.repo.buscarPorId(input.servicoId);
    if (!servico) throw new ServicoNaoEncontradoException(input.servicoId);

    servico.alterar({ descricao: input.descricao, valor: input.valor });
    return this.repo.salvar(servico);
  }
}
