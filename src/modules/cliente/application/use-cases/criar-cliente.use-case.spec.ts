import { Cliente } from '../../domain/entities/cliente.entity';
import { DocumentoJaCadastradoException } from '../../domain/exceptions/documento-ja-cadastrado.exception';
import { ClienteRepository } from '../../domain/repositories/cliente.repository';
import { CriarClienteUseCase } from './criar-cliente.use-case';

class RepoFake implements ClienteRepository {
  clientes: Cliente[] = [];
  documentoExiste = false;
  salvar = jest.fn(async (c: Cliente) => {
    this.clientes.push(c);
  });
  buscarPorId = jest.fn(
    async (id: string) =>
      this.clientes.find((c) => c.clienteId === id) ?? null,
  );
  listar = jest.fn(async () => this.clientes);
  existeComDocumento = jest.fn(async () => this.documentoExiste);
}

const input = {
  numDocumento: '111.444.777-35',
  nome: 'João',
  telefone: '11',
  tipo: 'pessoa_fisica' as const,
};

describe('CriarClienteUseCase', () => {
  it('rejeita quando já existe cliente com o documento', async () => {
    const repo = new RepoFake();
    repo.documentoExiste = true;
    const uc = new CriarClienteUseCase(repo);
    await expect(uc.executar(input)).rejects.toBeInstanceOf(
      DocumentoJaCadastradoException,
    );
    expect(repo.salvar).not.toHaveBeenCalled();
  });

  it('cria e persiste quando documento é novo', async () => {
    const repo = new RepoFake();
    const uc = new CriarClienteUseCase(repo);
    const cliente = await uc.executar(input);
    expect(cliente).toBeInstanceOf(Cliente);
    expect(repo.salvar).toHaveBeenCalledTimes(1);
    expect(cliente.nome).toBe('João');
  });
});
