import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateInsumoDto } from './dto/update-insumo.dto';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { InsumosRepository } from './repositories/insumos.repository';

@Injectable()
export class InsumosService {

  constructor(private readonly insumosRepository: InsumosRepository) { }

  async create(createInsumoDto: CreateInsumoDto) {
    return await this.insumosRepository.create(createInsumoDto)
  }

  async findAll() {
    return await this.insumosRepository.findAll();
  }

  async findOne(id: number) {
    return await this.insumosRepository.findOne(id);
  }

  async update(id: number, updateInsumoDto: UpdateInsumoDto) {
    return await this.insumosRepository.update(id, updateInsumoDto)
  }

  async remove(id: number) {
    return await this.insumosRepository.remove(id);
  }
}
