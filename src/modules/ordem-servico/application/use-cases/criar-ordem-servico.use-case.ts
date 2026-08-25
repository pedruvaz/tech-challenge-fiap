import { randomUUID } from 'crypto';
import { OrdemServico } from '../../domain/entities/ordem-servico.entity';
import {
  ClienteNaoEncontradoException,
  MecanicoNaoEncontradoException,
  VeiculoNaoEncontradoException,
} from '../../domain/exceptions/recurso-nao-encontrado.exception';
import { VeiculoNaoPertenceAoClienteException } from '../../domain/exceptions/relacionamento-invalido.exception';
import { ClienteRepository } from '../../domain/repositories/cliente.repository';
import { MecanicoRepository } from '../../domain/repositories/mecanico.repository';
import { OrdemServicoRepository } from '../../domain/repositories/ordem-servico.repository';
import { UnitOfWork } from '../../domain/repositories/unit-of-work';
import { VeiculoRepository } from '../../domain/repositories/veiculo.repository';

export type CriarOrdemServicoInput = {
  mecanicoId: number;
  clienteId: string;
  veiculoId: string;
};

export class CriarOrdemServicoUseCase {
  constructor(
    private readonly osRepo: OrdemServicoRepository,
    private readonly mecanicoRepo: MecanicoRepository,
    private readonly clienteRepo: ClienteRepository,
    private readonly veiculoRepo: VeiculoRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async executar(input: CriarOrdemServicoInput): Promise<OrdemServico> {
    const mecanico = await this.mecanicoRepo.buscarPorId(input.mecanicoId);
    if (!mecanico) throw new MecanicoNaoEncontradoException(input.mecanicoId);

    const cliente = await this.clienteRepo.buscarPorId(input.clienteId);
    if (!cliente) throw new ClienteNaoEncontradoException(input.clienteId);

    const veiculo = await this.veiculoRepo.buscarPorId(input.veiculoId);
    if (!veiculo) throw new VeiculoNaoEncontradoException(input.veiculoId);

    const vinculo = await this.veiculoRepo.veiculoPertenceAoCliente(
      input.veiculoId,
      input.clienteId,
    );
    if (!vinculo) {
      throw new VeiculoNaoPertenceAoClienteException(
        input.veiculoId,
        input.clienteId,
      );
    }

    const os = OrdemServico.criar({
      osId: randomUUID(),
      mecanicoId: input.mecanicoId,
      clienteId: input.clienteId,
      veiculoId: input.veiculoId,
    });

    await this.uow.executar(async () => {
      await this.osRepo.salvar(os);
    });

    const persistida = await this.osRepo.buscarPorId(os.osId);
    return persistida ?? os;
  }
}
