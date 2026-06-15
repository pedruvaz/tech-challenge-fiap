import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateInsumoDto } from './dto/update-insumo.dto';
import { CreateInsumoDto } from './dto/create-insumo.dto';

@Injectable()
export class InsumosService {

  constructor(private prisma: PrismaService) { }

  async create(createInsumoDto: CreateInsumoDto) {
    return await this.prisma.insumo.create({
      data: createInsumoDto
    });
  }

  async findAll() {
    return await this.prisma.insumo.findMany();
  }

  async findOne(id: number) {
    const insumo = await this.prisma.insumo.findUnique({ where: { insumoId: Number(id) } })
    if (!insumo) {
      throw new NotFoundException('Insumo não encontrado.');
    }
    return insumo;
  }

  async update(id: number, updateInsumoDto: UpdateInsumoDto) {
    return await this.prisma.insumo.update({
      where: { insumoId: id },
      data: updateInsumoDto,
    });
  }

  async remove(id: number) {
    return await this.prisma.insumo.delete({ where: { insumoId: id } });
  }
}
