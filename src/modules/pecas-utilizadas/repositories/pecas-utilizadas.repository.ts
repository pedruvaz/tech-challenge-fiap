import { Injectable } from '@nestjs/common';
import { UpdatePecasUtilizadaDto } from '../dto/update-pecas-utilizada.dto';
import { CreatePecasUtilizadaDto } from '../dto/create-pecas-utilizada.dto';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PecasUtilizadasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPecasUtilizadaDto: CreatePecasUtilizadaDto) {
    return this.prisma.pecaUtilizada.create({
      data: createPecasUtilizadaDto,
    });
  }

  async findAll() {
    return this.prisma.pecaUtilizada.findMany({
      include: {
        peca: true,
        ordemServico: true,
      },
    });
  }

  async findOne(osId: string, pecaId: number) {
    return this.prisma.pecaUtilizada.findUnique({
      where: {
        osId_pecaId: {
          osId,
          pecaId,
        },
      },
      include: {
        peca: true,
        ordemServico: true,
      },
    });
  }

  async findByOrdemServico(osId: string) {
    return this.prisma.pecaUtilizada.findMany({
      where: {
        osId,
      },
      include: {
        peca: true,
        ordemServico: true,
      },
    });
  }

  async update(
    osId: string,
    pecaId: number,
    updatePecasUtilizadaDto: UpdatePecasUtilizadaDto,
  ) {
    return this.prisma.pecaUtilizada.update({
      where: {
        osId_pecaId: {
          osId,
          pecaId,
        },
      },
      data: updatePecasUtilizadaDto,
    });
  }

  async remove(osId: string, pecaId: number) {
    return this.prisma.pecaUtilizada.delete({
      where: {
        osId_pecaId: {
          osId,
          pecaId,
        },
      },
    });
  }
}
