import { Cliente } from '../../domain/entities/cliente.entity';
import { ClienteNaoEncontradoException } from '../../domain/exceptions/cliente-nao-encontrado.exception';
import { DocumentoJaCadastradoException } from '../../domain/exceptions/documento-ja-cadastrado.exception';
import { ClienteRepository } from '../../domain/repositories/cliente.repository';
import { TipoCliente, TipoClienteValor } from '../../domain/value-objects/tipo-cliente.vo';

export type AtualizarClienteInput = {
  clienteId: string;
  nome?: string;
  telefone?: string;
  numDocumento?: string;
  tipo?: TipoClienteValor;
};

export class AtualizarClienteUseCase {
  constructor(private readonly repo: ClienteRepository) {}

  async executar(input: AtualizarClienteInput): Promise<Cliente> {
    const cliente = await this.repo.buscarPorId(input.clienteId);
    if (!cliente) throw new ClienteNaoEncontradoException(input.clienteId);

    if (input.numDocumento !== undefined) {
      const conflito = await this.repo.existeComDocumento(
        input.numDocumento,
        input.clienteId,
      );
      if (conflito) throw new DocumentoJaCadastradoException();
    }

    cliente.alterar({
      nome: input.nome,
      telefone: input.telefone,
      numDocumento: input.numDocumento,
      tipo: input.tipo !== undefined ? TipoCliente.de(input.tipo) : undefined,
    });

    await this.repo.salvar(cliente);
    return (await this.repo.buscarPorId(cliente.clienteId)) ?? cliente;
  }
}
