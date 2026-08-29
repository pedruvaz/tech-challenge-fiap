import { AtualizarClienteUseCase } from '../../application/use-cases/atualizar-cliente.use-case';
import { BuscarClientePorIdUseCase } from '../../application/use-cases/buscar-cliente-por-id.use-case';
import { CriarClienteUseCase } from '../../application/use-cases/criar-cliente.use-case';
import { ListarClientesUseCase } from '../../application/use-cases/listar-clientes.use-case';
import { RemoverClienteUseCase } from '../../application/use-cases/remover-cliente.use-case';
import { Cliente } from '../../domain/entities/cliente.entity';
import { ClienteNaoEncontradoException } from '../../domain/exceptions/cliente-nao-encontrado.exception';
import { TipoCliente } from '../../domain/value-objects/tipo-cliente.vo';
import { ClienteController } from './cliente.controller';

const cliente = (clienteId = 'c1', nome = 'Maria'): Cliente =>
  Cliente.criar({
    clienteId,
    nome,
    telefone: '11999999999',
    numDocumento: '111.444.777-35',
    tipo: TipoCliente.pessoaFisica(),
  });

function montar() {
  const criar = { executar: jest.fn() };
  const listar = { executar: jest.fn() };
  const buscarPorId = { executar: jest.fn() };
  const atualizar = { executar: jest.fn() };
  const remover = { executar: jest.fn() };

  const controller = new ClienteController(
    criar as unknown as CriarClienteUseCase,
    listar as unknown as ListarClientesUseCase,
    buscarPorId as unknown as BuscarClientePorIdUseCase,
    atualizar as unknown as AtualizarClienteUseCase,
    remover as unknown as RemoverClienteUseCase,
  );

  return { controller, criar, listar, buscarPorId, atualizar, remover };
}

describe('ClienteController', () => {
  describe('POST /clientes', () => {
    it('repassa o body ao use-case e devolve o DTO apresentado', async () => {
      const { controller, criar } = montar();
      criar.executar.mockResolvedValue(cliente());
      const body = {
        nome: 'Maria',
        telefone: '11999999999',
        numDocumento: '111.444.777-35',
        tipo: 'pessoa_fisica' as const,
      };

      const dto = await controller.criarCliente(body);

      expect(criar.executar).toHaveBeenCalledWith(body);
      expect(dto.clienteId).toBe('c1');
      expect(dto.tipo).toBe('pessoa_fisica');
    });
  });

  describe('GET /clientes', () => {
    it('apresenta a lista devolvida pelo use-case', async () => {
      const { controller, listar } = montar();
      listar.executar.mockResolvedValue([
        cliente('c1', 'Maria'),
        cliente('c2', 'João'),
      ]);

      const dtos = await controller.listarClientes();

      expect(dtos.map((d) => d.clienteId)).toEqual(['c1', 'c2']);
    });

    it('devolve array vazio quando não há clientes', async () => {
      const { controller, listar } = montar();
      listar.executar.mockResolvedValue([]);

      await expect(controller.listarClientes()).resolves.toEqual([]);
    });
  });

  describe('GET /clientes/:id', () => {
    it('busca pelo id da rota', async () => {
      const { controller, buscarPorId } = montar();
      buscarPorId.executar.mockResolvedValue(cliente());

      const dto = await controller.buscar('c1');

      expect(buscarPorId.executar).toHaveBeenCalledWith('c1');
      expect(dto.clienteId).toBe('c1');
    });

    it('propaga ClienteNaoEncontradoException', async () => {
      const { controller, buscarPorId } = montar();
      buscarPorId.executar.mockRejectedValue(
        new ClienteNaoEncontradoException('sumiu'),
      );

      await expect(controller.buscar('sumiu')).rejects.toThrow(
        ClienteNaoEncontradoException,
      );
    });
  });

  describe('PATCH /clientes/:id', () => {
    it('combina o id da rota com o body', async () => {
      const { controller, atualizar } = montar();
      atualizar.executar.mockResolvedValue(cliente('c1', 'Maria Silva'));

      const dto = await controller.atualizarCliente('c1', {
        nome: 'Maria Silva',
      });

      expect(atualizar.executar).toHaveBeenCalledWith({
        clienteId: 'c1',
        nome: 'Maria Silva',
      });
      expect(dto.nome).toBe('Maria Silva');
    });
  });

  describe('DELETE /clientes/:id', () => {
    it('delega a remoção e resolve sem corpo', async () => {
      const { controller, remover } = montar();
      remover.executar.mockResolvedValue(undefined);

      await expect(controller.removerCliente('c1')).resolves.toBeUndefined();
      expect(remover.executar).toHaveBeenCalledWith('c1');
    });

    it('propaga erro quando o cliente não existe', async () => {
      const { controller, remover } = montar();
      remover.executar.mockRejectedValue(
        new ClienteNaoEncontradoException('sumiu'),
      );

      await expect(controller.removerCliente('sumiu')).rejects.toThrow(
        ClienteNaoEncontradoException,
      );
    });
  });
});
