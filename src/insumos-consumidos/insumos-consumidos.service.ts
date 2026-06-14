import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInsumosConsumidoDto } from './dto/create-insumos-consumido.dto';
import { UpdateInsumosConsumidoDto } from './dto/update-insumos-consumido.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InsumosConsumidosService {

  constructor(private prisma: PrismaService) { }

  async create(createInsumosConsumidoDto: CreateInsumosConsumidoDto) {
    return await this.prisma.insumoConsumido.create({
      data: createInsumosConsumidoDto
    });
  }

  async findAll() {
    return await this.prisma.insumoConsumido.findMany({
      include: {
        insumo: true,
        ordemServico: true,
      },
    });
  }

  async findOne(osId: string, insumoId: number) {
    const insumoConsumido = await this.prisma.insumoConsumido.findUnique({
      where: {
        osId_insumoId: {
          osId,
          insumoId,
        },
      },
      include: {
        insumo: true,
        ordemServico: true,
      },
    });

    if (!insumoConsumido) {
      throw new NotFoundException('Insumo conssumido não encontrado.');
    }
    return insumoConsumido;
  }

  async update(osId: string,
    insumoId: number,
    updateInsumosConsumidoDto: UpdateInsumosConsumidoDto) {
    return this.prisma.insumoConsumido.update({
      where: {
        osId_insumoId: {
          osId,
          insumoId,
        },
      },
      data: updateInsumosConsumidoDto
    });
  }

  async remove(osId: string, insumoId: number) {
    return this.prisma.insumoConsumido.delete({
      where: {
        osId_insumoId: {
          osId,
          insumoId,
        },
      },
    });
  }
}
