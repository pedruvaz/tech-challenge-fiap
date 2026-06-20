import { Injectable } from '@nestjs/common';
import { CreatePecaDto } from './dto/create-peca.dto';
import { UpdatePecaDto } from './dto/update-peca.dto';
import { PecasRepository } from './repositories/pecas.repository';

@Injectable()
export class PecasService {
  constructor(private readonly pecasRepository: PecasRepository) {}

  async create(createPecaDto: CreatePecaDto) {
    return await this.pecasRepository.create(createPecaDto);
  }

  async findAll() {
    return await this.pecasRepository.findAll();
  }

  async findOne(id: number) {
    return await this.pecasRepository.findOne(id);
  }

  async update(id: number, updatePecaDto: UpdatePecaDto) {
    return await this.pecasRepository.update(id, updatePecaDto);
  }

  async remove(id: number) {
    return await this.pecasRepository.remove(id);
  }
}
