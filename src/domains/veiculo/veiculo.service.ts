import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';
import { VeiculoResponseDto } from './dto/veiculo-response.dto';
import { VeiculoRepository } from './veiculo.repository';

@Injectable()
export class VeiculoService {
  constructor(private readonly veiculoRepository: VeiculoRepository) {}

  async create(dto: CreateVeiculoDto): Promise<VeiculoResponseDto> {
    const veiculoExistente = await this.veiculoRepository.findByPlaca(
      dto.placa,
    );

    if (veiculoExistente) {
      throw new ConflictException('Já existe um veículo com esta placa');
    }

    const veiculo = await this.veiculoRepository.create(dto);
    return new VeiculoResponseDto(veiculo);
  }

  async findAll(): Promise<VeiculoResponseDto[]> {
    const veiculos = await this.veiculoRepository.findAll();
    return veiculos.map((veiculo) => new VeiculoResponseDto(veiculo));
  }

  async findById(veiculoId: string): Promise<VeiculoResponseDto> {
    const veiculo = await this.veiculoRepository.findById(veiculoId);

    if (!veiculo) {
      throw new NotFoundException(`Veículo com id ${veiculoId} não encontrado`);
    }

    return new VeiculoResponseDto(veiculo);
  }

  async update(
    veiculoId: string,
    dto: UpdateVeiculoDto,
  ): Promise<VeiculoResponseDto> {
    await this.findById(veiculoId);

    if (dto.placa) {
      const veiculoComMesmaPlaca = await this.veiculoRepository.findByPlaca(
        dto.placa,
      );

      if (
        veiculoComMesmaPlaca &&
        veiculoComMesmaPlaca.veiculoId !== veiculoId
      ) {
        throw new ConflictException('Já existe um veículo com esta placa');
      }
    }

    const veiculo = await this.veiculoRepository.update(veiculoId, dto);
    return new VeiculoResponseDto(veiculo);
  }

  async remove(veiculoId: string): Promise<void> {
    await this.findById(veiculoId);
    await this.veiculoRepository.softDelete(veiculoId);
  }
}
