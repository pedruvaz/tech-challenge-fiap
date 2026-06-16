import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInsumosConsumidoDto } from './dto/create-insumos-consumido.dto';
import { UpdateInsumosConsumidoDto } from './dto/update-insumos-consumido.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { InsumosConsumidosRepository } from './repositories/insumos-consumidos.repository';

@Injectable()
export class InsumosConsumidosService {

  constructor(private insumosConsumidosRepository: InsumosConsumidosRepository) { }

  async create(createInsumosConsumidoDto: CreateInsumosConsumidoDto) {
    return await this.insumosConsumidosRepository.create(createInsumosConsumidoDto);
  }

  async findAll() {
    return await this.insumosConsumidosRepository.findAll();
  }

  async findOne(osId: string, insumoId: number) {
    const insumoConsumido = await this.insumosConsumidosRepository.findOne(
      osId,
      insumoId,
    );

    if (!insumoConsumido) {
      throw new NotFoundException('Insumo consumido não encontrado.');
    }
    return insumoConsumido;
  }

  async update(
    osId: string,
    insumoId: number,
    updateInsumosConsumidoDto: UpdateInsumosConsumidoDto) {
    return this.insumosConsumidosRepository.update(osId, insumoId, updateInsumosConsumidoDto);
  }

  async remove(osId: string, insumoId: number) {
    await this.findOne(osId, insumoId);

    return this.insumosConsumidosRepository.remove(osId, insumoId);
  }
}