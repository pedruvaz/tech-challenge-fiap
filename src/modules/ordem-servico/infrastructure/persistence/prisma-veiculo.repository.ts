import { Injectable } from '@nestjs/common';
import { Veiculo } from '../../domain/entities/veiculo.entity';
import { VeiculoRepository } from '../../domain/repositories/veiculo.repository';
import { PrismaTransactionContext } from './prisma-transaction-context';

@Injectable()
export class PrismaVeiculoRepository extends VeiculoRepository {
  constructor(private readonly ctx: PrismaTransactionContext) {
    super();
  }

  async buscarPorId(veiculoId: string): Promise<Veiculo | null> {
    const raw = await this.ctx.cliente().veiculo.findFirst({
      where: { veiculoId, deletadoEm: null },
    });
    return raw
      ? new Veiculo(raw.veiculoId, raw.placa, raw.marca, raw.modelo)
      : null;
  }

  async veiculoPertenceAoCliente(
    veiculoId: string,
    clienteId: string,
  ): Promise<boolean> {
    const vinculo = await this.ctx.cliente().veiculoCliente.findUnique({
      where: { veiculoId_clienteId: { veiculoId, clienteId } },
    });
    return vinculo !== null;
  }
}
