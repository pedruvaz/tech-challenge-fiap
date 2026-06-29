import { Injectable } from '@nestjs/common';
import { Veiculo } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';

@Injectable()
export class VeiculoRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateVeiculoDto): Promise<Veiculo> {
    const { clienteId, ...veiculoData } = data;
    // Cria o veículo e o vínculo com o cliente atomicamente: um veículo
    // sem dono é inútil, pois a OS exige o vínculo veiculo_cliente.
    return this.prisma.$transaction(async (tx) => {
      const veiculo = await tx.veiculo.create({ data: veiculoData });
      await tx.veiculoCliente.create({
        data: { veiculoId: veiculo.veiculoId, clienteId },
      });
      return veiculo;
    });
  }

  findAll(): Promise<Veiculo[]> {
    return this.prisma.veiculo.findMany({
      where: { deletadoEm: null },
      orderBy: { veiculoId: 'asc' },
    });
  }

  findById(veiculoId: string): Promise<Veiculo | null> {
    return this.prisma.veiculo.findFirst({
      where: { veiculoId, deletadoEm: null },
    });
  }

  findByPlaca(placa: string): Promise<Veiculo | null> {
    return this.prisma.veiculo.findFirst({
      where: { placa, deletadoEm: null },
    });
  }

  update(veiculoId: string, data: UpdateVeiculoDto): Promise<Veiculo> {
    return this.prisma.veiculo.update({
      where: { veiculoId },
      data,
    });
  }

  softDelete(veiculoId: string): Promise<Veiculo> {
    return this.prisma.veiculo.update({
      where: { veiculoId },
      data: { deletadoEm: new Date() },
    });
  }
}
