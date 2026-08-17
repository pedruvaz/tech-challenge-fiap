import { randomUUID } from 'crypto';
import { ClienteNaoEncontradoException } from '../../../cliente/domain/exceptions/cliente-nao-encontrado.exception';
import { ClienteRepository } from '../../../cliente/domain/repositories/cliente.repository';
import { Veiculo } from '../../domain/entities/veiculo.entity';
import { PlacaJaCadastradaException } from '../../domain/exceptions/placa-ja-cadastrada.exception';
import { VeiculoRepository } from '../../domain/repositories/veiculo.repository';

export type CriarVeiculoInput = {
  placa: string;
  clienteId: string;
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
};

export class CriarVeiculoUseCase {
  constructor(
    private readonly repo: VeiculoRepository,
    private readonly clienteRepo: ClienteRepository,
  ) {}

  async executar(input: CriarVeiculoInput): Promise<Veiculo> {
    if (await this.repo.existeComPlaca(input.placa)) {
      throw new PlacaJaCadastradaException();
    }

    const cliente = await this.clienteRepo.buscarPorId(input.clienteId);
    if (!cliente) throw new ClienteNaoEncontradoException(input.clienteId);

    const veiculo = Veiculo.criar({
      veiculoId: randomUUID(),
      placa: input.placa,
      marca: input.marca,
      modelo: input.modelo,
      ano: input.ano,
      cor: input.cor,
      clienteProprietarioId: input.clienteId,
    });

    await this.repo.salvar(veiculo);
    return (await this.repo.buscarPorId(veiculo.veiculoId)) ?? veiculo;
  }
}
