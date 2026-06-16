import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateServicosRealizadosDto } from './dto/update-servicos-realizado.dto';
import { CreateServicosRealizadosDto } from './dto/create-servicos-realizado.dto';
import { ServicosRealizadosRepository } from './repositories/servicos-realizados.repository';

@Injectable()
export class ServicosRealizadosService {

  constructor(private servicosRealizadosRepository: ServicosRealizadosRepository) { }

  async create(createServicosRealizadoDto: CreateServicosRealizadosDto) {
    return await this.servicosRealizadosRepository.create(createServicosRealizadoDto);
  }

  async findAll() {
    return await this.servicosRealizadosRepository.findAll();
  }

  async findOne(osId: string, servicoId: number) {
    const servicoRealizado = await this.servicosRealizadosRepository.findOne(
      osId,
      servicoId,
    );

    if (!servicoRealizado) {
      throw new NotFoundException('Serviço realizado não encontrado.');
    }
    return servicoRealizado;
  }

  async update(osId: string, servicoId: number, updateServicosRealizadoDto: UpdateServicosRealizadosDto) {
    return this.servicosRealizadosRepository.update(osId, servicoId, updateServicosRealizadoDto);
  }

  async remove(osId: string, servicoId: number) {
    await this.findOne(osId, servicoId);

    return this.servicosRealizadosRepository.remove(osId, servicoId);
  }
}
