import { PrismaService } from '../../../../prisma/prisma.service';
import { Cliente } from '../../domain/entities/cliente.entity';
import { DocumentoCliente } from '../../domain/value-objects/documento-cliente.vo';
import { TipoCliente } from '../../domain/value-objects/tipo-cliente.vo';
import { clienteInclude } from './mappers/cliente.mapper';
import { PrismaClienteRepository } from './prisma-cliente.repository';

const linha = (over: Record<string, unknown> = {}) => ({
  clienteId: 'c1',
  nome: 'Maria',
  telefone: '11999999999',
  numDocumento: '111.444.777-35',
  tipo: 'pessoa_fisica',
  criadoEm: new Date('2024-01-01T00:00:00Z'),
  atualizadoEm: new Date('2024-02-01T00:00:00Z'),
  deletadoEm: null,
  veiculos: [],
  ...over,
});

function montar() {
  const cliente = {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  return {
    repo: new PrismaClienteRepository({ cliente } as unknown as PrismaService),
    cliente,
  };
}

const novo = (): Cliente =>
  Cliente.criar({
    clienteId: 'c1',
    nome: 'Maria',
    telefone: '11999999999',
    numDocumento: '111.444.777-35',
    tipo: TipoCliente.pessoaFisica(),
  });

const persistido = (): Cliente =>
  Cliente.reconstituir({
    clienteId: 'c1',
    nome: 'Maria',
    telefone: '11999999999',
    documento: DocumentoCliente.reconstituir('111.444.777-35'),
    tipo: TipoCliente.pessoaFisica(),
    criadoEm: new Date('2024-01-01T00:00:00Z'),
    atualizadoEm: new Date('2024-02-01T00:00:00Z'),
    deletadoEm: null,
    veiculos: [],
  });

describe('PrismaClienteRepository', () => {
  describe('buscarPorId', () => {
    it('filtra por deletadoEm null e hidrata os veículos', async () => {
      const { repo, cliente } = montar();
      cliente.findFirst.mockResolvedValue(linha());

      const encontrado = await repo.buscarPorId('c1');

      expect(cliente.findFirst).toHaveBeenCalledWith({
        where: { clienteId: 'c1', deletadoEm: null },
        include: clienteInclude,
      });
      expect(encontrado?.clienteId).toBe('c1');
    });

    it('devolve null quando não encontra', async () => {
      const { repo, cliente } = montar();
      cliente.findFirst.mockResolvedValue(null);

      await expect(repo.buscarPorId('sumiu')).resolves.toBeNull();
    });
  });

  describe('listar', () => {
    it('devolve apenas os não deletados, ordenados por id', async () => {
      const { repo, cliente } = montar();
      cliente.findMany.mockResolvedValue([
        linha(),
        linha({ clienteId: 'c2', nome: 'João' }),
      ]);

      const clientes = await repo.listar();

      expect(cliente.findMany).toHaveBeenCalledWith({
        where: { deletadoEm: null },
        orderBy: { clienteId: 'asc' },
        include: clienteInclude,
      });
      expect(clientes.map((c) => c.clienteId)).toEqual(['c1', 'c2']);
    });

    it('devolve lista vazia quando não há linhas', async () => {
      const { repo, cliente } = montar();
      cliente.findMany.mockResolvedValue([]);

      await expect(repo.listar()).resolves.toEqual([]);
    });
  });

  describe('existeComDocumento', () => {
    it('é falso quando ninguém usa o documento', async () => {
      const { repo, cliente } = montar();
      cliente.findFirst.mockResolvedValue(null);

      await expect(repo.existeComDocumento('111.444.777-35')).resolves.toBe(
        false,
      );
    });

    it('é verdadeiro quando outro cliente usa o documento', async () => {
      const { repo, cliente } = montar();
      cliente.findFirst.mockResolvedValue({ clienteId: 'outro' });

      await expect(repo.existeComDocumento('111.444.777-35')).resolves.toBe(
        true,
      );
    });

    it('ignora o próprio cliente na checagem', async () => {
      const { repo, cliente } = montar();
      cliente.findFirst.mockResolvedValue({ clienteId: 'c1' });

      await expect(
        repo.existeComDocumento('111.444.777-35', 'c1'),
      ).resolves.toBe(false);
    });

    it('continua sendo conflito quando o id a ignorar é outro', async () => {
      const { repo, cliente } = montar();
      cliente.findFirst.mockResolvedValue({ clienteId: 'c9' });

      await expect(
        repo.existeComDocumento('111.444.777-35', 'c1'),
      ).resolves.toBe(true);
    });
  });

  describe('salvar', () => {
    it('cria quando o cliente é novo', async () => {
      const { repo, cliente } = montar();

      await repo.salvar(novo());

      expect(cliente.create).toHaveBeenCalledWith({
        data: {
          clienteId: 'c1',
          nome: 'Maria',
          telefone: '11999999999',
          numDocumento: '111.444.777-35',
          tipo: 'pessoa_fisica',
          deletadoEm: null,
        },
      });
      expect(cliente.update).not.toHaveBeenCalled();
    });

    it('atualiza quando o cliente já existia', async () => {
      const { repo, cliente } = montar();

      await repo.salvar(persistido());

      expect(cliente.update).toHaveBeenCalledWith({
        where: { clienteId: 'c1' },
        data: expect.objectContaining({
          numDocumento: '111.444.777-35',
        }) as unknown,
      });
      expect(cliente.create).not.toHaveBeenCalled();
    });

    it('persiste o soft delete no update', async () => {
      const { repo, cliente } = montar();
      const alvo = persistido();
      const agora = new Date('2025-01-01T00:00:00Z');
      alvo.softDelete(agora);

      await repo.salvar(alvo);

      expect(cliente.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ deletadoEm: agora }) as unknown,
        }),
      );
    });
  });
});
