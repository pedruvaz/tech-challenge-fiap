import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { ClienteResponseDto } from './dto/cliente-response.dto';
import { ClienteRepository } from './cliente.repository';

@Injectable()
export class ClienteService {
  constructor(private readonly clienteRepository: ClienteRepository) {}

  async create(dto: CreateClienteDto): Promise<ClienteResponseDto> {
    const clienteExistente = await this.clienteRepository.findByNumDocumento(
      dto.numDocumento,
    );

    if (clienteExistente) {
      throw new ConflictException(
        'Já existe um cliente com este número de documento',
      );
    }

    const cliente = await this.clienteRepository.create(dto);
    return new ClienteResponseDto(cliente);
  }

  async findAll(): Promise<ClienteResponseDto[]> {
    const clientes = await this.clienteRepository.findAll();
    return clientes.map((cliente) => new ClienteResponseDto(cliente));
  }

  async findById(clienteId: string): Promise<ClienteResponseDto> {
    const cliente = await this.clienteRepository.findById(clienteId);

    if (!cliente) {
      throw new NotFoundException(`Cliente com id ${clienteId} não encontrado`);
    }

    return new ClienteResponseDto(cliente);
  }

  async update(
    clienteId: string,
    dto: UpdateClienteDto,
  ): Promise<ClienteResponseDto> {
    await this.findById(clienteId);

    if (dto.numDocumento) {
      const clienteComMesmoDocumento =
        await this.clienteRepository.findByNumDocumento(dto.numDocumento);

      if (
        clienteComMesmoDocumento &&
        clienteComMesmoDocumento.clienteId !== clienteId
      ) {
        throw new ConflictException(
          'Já existe um cliente com este número de documento',
        );
      }
    }

    const cliente = await this.clienteRepository.update(clienteId, dto);
    return new ClienteResponseDto(cliente);
  }

  async remove(clienteId: string): Promise<void> {
    await this.findById(clienteId);
    await this.clienteRepository.softDelete(clienteId);
  }
}
