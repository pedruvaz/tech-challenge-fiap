import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateInsumoDto } from './dto/update-insumo.dto';
import { CreateInsumoDto } from './dto/create-insumo.dto';

@Injectable()
export class InsumosService {

  constructor(private prisma: PrismaService) { }

  async create(createInsumoDto: CreateInsumoDto) {
    return await this.prisma.insumo.create({
      data: {
        nome: createInsumoDto.nome,
        qtdEstoque: createInsumoDto.qtdEstoque,
        valorUn: createInsumoDto.valorUn
      }
    });
  }

  async findAll() {
    return await this.prisma.insumo.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.insumo.findUnique({ where: { insumoId: Number(id) } });

  }

  async update(id: number, updateInsumoDto: UpdateInsumoDto) {
    return await this.prisma.insumo.update({
      where: { insumoId: Number(id) },
      data: {
        nome: updateInsumoDto.nome,
        qtdEstoque: updateInsumoDto.qtdEstoque,
        valorUn: updateInsumoDto.valorUn,
      },
    });
  }

  async remove(id: number) {
    return await this.prisma.insumo.delete({ where: { insumoId: Number(id) } });
  }
}
