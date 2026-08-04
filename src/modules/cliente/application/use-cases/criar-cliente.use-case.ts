import { randomUUID } from 'crypto';
import { Cliente } from '../../domain/entities/cliente.entity';
import { DocumentoJaCadastradoException } from '../../domain/exceptions/documento-ja-cadastrado.exception';
import { ClienteRepository } from '../../domain/repositories/cliente.repository';
import { TipoCliente, TipoClienteValor } from '../../domain/value-objects/tipo-cliente.vo';

export type CriarClienteInput = {
  numDocumento: string;
  nome: string;
  telefone: string;
  tipo: TipoClienteValor;
};

export class CriarClienteUseCase {
  constructor(private readonly repo: ClienteRepository) {}

  async executar(input: CriarClienteInput): Promise<Cliente> {
    if (await this.repo.existeComDocumento(input.numDocumento)) {
      throw new DocumentoJaCadastradoException();
    }

    const cliente = Cliente.criar({
      clienteId: randomUUID(),
      nome: input.nome,
      telefone: input.telefone,
      numDocumento: input.numDocumento,
      tipo: TipoCliente.de(input.tipo),
    });

    await this.repo.salvar(cliente);
    return (await this.repo.buscarPorId(cliente.clienteId)) ?? cliente;
  }
}
