import { Injectable } from '@nestjs/common';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';
import { ServicoRepository } from './repositories/servico.repository';

@Injectable()
export class ServicoService {

  constructor(private readonly servicoRepository: ServicoRepository) { }

  async create(createServicoDto: CreateServicoDto) {
    return await this.servicoRepository.create(createServicoDto)
  }

  async findAll() {
    return await this.servicoRepository.findAll();
  }

  async findOne(id: number) {
    const insumo = await this.servicoRepository.findOne(id);
  }

  async update(id: number, updateServicoDto: UpdateServicoDto) {
    return await this.servicoRepository.update(id, updateServicoDto)
  }

  async remove(id: number) {
    return await this.servicoRepository.remove(id);
  }
}
