import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Veiculo } from '../../domain/entities/veiculo.entity';
import { VeiculoRepository } from '../../domain/repositories/veiculo.repository';
import { reconstituirVeiculo } from './mappers/veiculo.mapper';

@Injectable()
export class PrismaVeiculoRepository extends VeiculoRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async buscarPorId(veiculoId: string): Promise<Veiculo | null> {
    const raw = await this.prisma.veiculo.findFirst({
      where: { veiculoId, deletadoEm: null },
    });
    return raw ? reconstituirVeiculo(raw) : null;
  }

  async listar(): Promise<Veiculo[]> {
    const rows = await this.prisma.veiculo.findMany({
      where: { deletadoEm: null },
      orderBy: { veiculoId: 'asc' },
    });
    return rows.map(reconstituirVeiculo);
  }

  async existeComPlaca(
    placa: string,
    ignorarVeiculoId?: string,
  ): Promise<boolean> {
    const existente = await this.prisma.veiculo.findFirst({
      where: { placa, deletadoEm: null },
      select: { veiculoId: true },
    });
    if (!existente) return false;
    if (ignorarVeiculoId && existente.veiculoId === ignorarVeiculoId)
      return false;
    return true;
  }

  async salvar(veiculo: Veiculo): Promise<void> {
    const dados = {
      placa: veiculo.placa.valor,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      ano: veiculo.ano,
      cor: veiculo.cor,
      deletadoEm: veiculo.deletadoEm,
    };

    if (veiculo.foiCriadoAgora) {
      // Cria o veículo e o vínculo com o cliente atomicamente: um veículo
      // sem dono é inútil, pois a OS exige o vínculo veiculo_cliente.
      const clienteId = veiculo.clienteProprietarioId;
      if (!clienteId) {
        throw new Error(
          'Veiculo recém-criado sem clienteProprietarioId — invariante violada',
        );
      }
      await this.prisma.$transaction(async (tx) => {
        await tx.veiculo.create({
          data: { veiculoId: veiculo.veiculoId, ...dados },
        });
        await tx.veiculoCliente.create({
          data: { veiculoId: veiculo.veiculoId, clienteId },
        });
      });
    } else {
      await this.prisma.veiculo.update({
        where: { veiculoId: veiculo.veiculoId },
        data: dados,
      });
    }
  }
}
