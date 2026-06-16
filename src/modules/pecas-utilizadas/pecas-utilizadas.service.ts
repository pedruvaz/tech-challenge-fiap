import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePecasUtilizadaDto } from './dto/create-pecas-utilizada.dto';
import { UpdatePecasUtilizadaDto } from './dto/update-pecas-utilizada.dto';
import { PecasUtilizadasRepository } from './repositories/pecas-utilizadas.repository';

@Injectable()
export class PecasUtilizadasService {

  constructor(
    private readonly pecasUtilizadasRepository: PecasUtilizadasRepository,
  ) { }

  async create(createPecasUtilizadaDto: CreatePecasUtilizadaDto) {
    return await this.pecasUtilizadasRepository.create(createPecasUtilizadaDto);
  }

  async findAll() {
    return await this.pecasUtilizadasRepository.findAll();
  }

  async findOne(osId: string, pecaId: number) {
    const pecaUtilizada = await this.pecasUtilizadasRepository.findOne(
      osId,
      pecaId
    );

    if (!pecaUtilizada) {
      throw new NotFoundException('Peça não encontrada.');
    }

    return pecaUtilizada;
  }

  update(
    osId: string,
    pecaId: number,
    updatePecasUtilizadaDto: UpdatePecasUtilizadaDto) {
    return this.pecasUtilizadasRepository.update(osId,
      pecaId,
      updatePecasUtilizadaDto
    );
  }

  async remove(osId: string, pecaId: number) {
    await this.findOne(osId, pecaId);

    return this.pecasUtilizadasRepository.remove(osId, pecaId);
  }
}
