import { Cliente } from '../../domain/entities/cliente.entity';
import { ClienteNaoEncontradoException } from '../../domain/exceptions/cliente-nao-encontrado.exception';
import { DocumentoJaCadastradoException } from '../../domain/exceptions/documento-ja-cadastrado.exception';
import { ClienteRepository } from '../../domain/repositories/cliente.repository';
import { TipoCliente } from '../../domain/value-objects/tipo-cliente.vo';
import { AtualizarClienteUseCase } from './atualizar-cliente.use-case';

const CPF = '111.444.777-35';
const OUTRO_CPF = '529.982.247-25';
const CNPJ = '11.222.333/0001-81';

const clienteExistente = (): Cliente =>
  Cliente.criar({
    clienteId: 'c1',
    nome: 'Maria',
    telefone: '11999999999',
    numDocumento: CPF,
    tipo: TipoCliente.pessoaFisica(),
  });

const criarRepo = (cliente: Cliente | null, conflito = false) =>
  ({
    salvar: jest.fn().mockResolvedValue(undefined),
    buscarPorId: jest.fn().mockResolvedValue(cliente),
    listar: jest.fn(),
    existeComDocumento: jest.fn().mockResolvedValue(conflito),
  }) as unknown as ClienteRepository;

describe('AtualizarClienteUseCase', () => {
  it('lança ClienteNaoEncontradoException quando o cliente não existe', async () => {
    const repo = criarRepo(null);

    await expect(
      new AtualizarClienteUseCase(repo).executar({ clienteId: 'sumiu' }),
    ).rejects.toThrow(ClienteNaoEncontradoException);
    expect(repo.salvar).not.toHaveBeenCalled();
  });

  it('rejeita quando o novo documento já pertence a outro cliente', async () => {
    const repo = criarRepo(clienteExistente(), true);

    await expect(
      new AtualizarClienteUseCase(repo).executar({
        clienteId: 'c1',
        numDocumento: OUTRO_CPF,
      }),
    ).rejects.toThrow(DocumentoJaCadastradoException);
    expect(repo.existeComDocumento).toHaveBeenCalledWith(OUTRO_CPF, 'c1');
    expect(repo.salvar).not.toHaveBeenCalled();
  });

  it('não checa unicidade quando o documento não é alterado', async () => {
    const repo = criarRepo(clienteExistente());

    await new AtualizarClienteUseCase(repo).executar({
      clienteId: 'c1',
      nome: 'Maria Silva',
    });

    expect(repo.existeComDocumento).not.toHaveBeenCalled();
    expect(repo.salvar).toHaveBeenCalledTimes(1);
  });

  it('altera nome e telefone e persiste', async () => {
    const cliente = clienteExistente();
    const repo = criarRepo(cliente);

    await new AtualizarClienteUseCase(repo).executar({
      clienteId: 'c1',
      nome: 'Maria Silva',
      telefone: '11888888888',
    });

    expect(cliente.nome).toBe('Maria Silva');
    expect(cliente.telefone).toBe('11888888888');
    expect(repo.salvar).toHaveBeenCalledWith(cliente);
  });

  it('revalida o documento contra o novo tipo ao migrar PF para PJ', async () => {
    const cliente = clienteExistente();
    const repo = criarRepo(cliente);

    await new AtualizarClienteUseCase(repo).executar({
      clienteId: 'c1',
      numDocumento: CNPJ,
      tipo: 'pessoa_juridica',
    });

    expect(cliente.tipo.ehPessoaJuridica()).toBe(true);
    expect(cliente.documento.numero).toBe(CNPJ);
  });

  it('devolve a releitura do repositório após salvar', async () => {
    const cliente = clienteExistente();
    const releitura = clienteExistente();
    const repo = {
      salvar: jest.fn().mockResolvedValue(undefined),
      buscarPorId: jest
        .fn()
        .mockResolvedValueOnce(cliente)
        .mockResolvedValueOnce(releitura),
      listar: jest.fn(),
      existeComDocumento: jest.fn().mockResolvedValue(false),
    } as unknown as ClienteRepository;

    const resultado = await new AtualizarClienteUseCase(repo).executar({
      clienteId: 'c1',
      nome: 'Maria Silva',
    });

    expect(resultado).toBe(releitura);
  });

  it('cai de volta na instância em memória quando a releitura vem vazia', async () => {
    const cliente = clienteExistente();
    const repo = {
      salvar: jest.fn().mockResolvedValue(undefined),
      buscarPorId: jest
        .fn()
        .mockResolvedValueOnce(cliente)
        .mockResolvedValueOnce(null),
      listar: jest.fn(),
      existeComDocumento: jest.fn().mockResolvedValue(false),
    } as unknown as ClienteRepository;

    const resultado = await new AtualizarClienteUseCase(repo).executar({
      clienteId: 'c1',
      nome: 'Maria Silva',
    });

    expect(resultado).toBe(cliente);
  });
});
