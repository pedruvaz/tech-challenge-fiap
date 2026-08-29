import { AtualizarVeiculoUseCase } from '../../application/use-cases/atualizar-veiculo.use-case';
import { BuscarVeiculoPorIdUseCase } from '../../application/use-cases/buscar-veiculo-por-id.use-case';
import { CriarVeiculoUseCase } from '../../application/use-cases/criar-veiculo.use-case';
import { ListarVeiculosUseCase } from '../../application/use-cases/listar-veiculos.use-case';
import { RemoverVeiculoUseCase } from '../../application/use-cases/remover-veiculo.use-case';
import { Veiculo } from '../../domain/entities/veiculo.entity';
import { VeiculoNaoEncontradoException } from '../../domain/exceptions/veiculo-nao-encontrado.exception';
import { VeiculoController } from './veiculo.controller';

const veiculo = (id = 'v1', placa = 'ABC1D23'): Veiculo =>
  Veiculo.criar({
    veiculoId: id,
    placa,
    marca: 'Toyota',
    modelo: 'Corolla',
    ano: '2020',
    cor: 'Preto',
    clienteProprietarioId: 'c1',
  });

function montar() {
  const criar = { executar: jest.fn() };
  const listar = { executar: jest.fn() };
  const buscarPorId = { executar: jest.fn() };
  const atualizar = { executar: jest.fn() };
  const remover = { executar: jest.fn() };

  const controller = new VeiculoController(
    criar as unknown as CriarVeiculoUseCase,
    listar as unknown as ListarVeiculosUseCase,
    buscarPorId as unknown as BuscarVeiculoPorIdUseCase,
    atualizar as unknown as AtualizarVeiculoUseCase,
    remover as unknown as RemoverVeiculoUseCase,
  );

  return { controller, criar, listar, buscarPorId, atualizar, remover };
}

describe('VeiculoController', () => {
  describe('POST /veiculos', () => {
    it('repassa o body ao use-case e devolve o DTO apresentado', async () => {
      const { controller, criar } = montar();
      criar.executar.mockResolvedValue(veiculo());
      const body = {
        placa: 'ABC1D23',
        clienteId: 'c1',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: '2020',
        cor: 'Preto',
      };

      const dto = await controller.criarVeiculo(body);

      expect(criar.executar).toHaveBeenCalledWith(body);
      expect(dto.veiculoId).toBe('v1');
      expect(dto.placa).toBe('ABC1D23');
    });
  });

  describe('GET /veiculos', () => {
    it('apresenta a lista devolvida pelo use-case', async () => {
      const { controller, listar } = montar();
      listar.executar.mockResolvedValue([
        veiculo('v1', 'ABC1D23'),
        veiculo('v2', 'XYZ4321'),
      ]);

      const dtos = await controller.listarVeiculos();

      expect(dtos.map((d) => d.veiculoId)).toEqual(['v1', 'v2']);
    });

    it('devolve array vazio quando não há veículos', async () => {
      const { controller, listar } = montar();
      listar.executar.mockResolvedValue([]);

      await expect(controller.listarVeiculos()).resolves.toEqual([]);
    });
  });

  describe('GET /veiculos/:id', () => {
    it('busca pelo id da rota', async () => {
      const { controller, buscarPorId } = montar();
      buscarPorId.executar.mockResolvedValue(veiculo());

      const dto = await controller.buscar('v1');

      expect(buscarPorId.executar).toHaveBeenCalledWith('v1');
      expect(dto.veiculoId).toBe('v1');
    });

    it('propaga VeiculoNaoEncontradoException do use-case', async () => {
      const { controller, buscarPorId } = montar();
      buscarPorId.executar.mockRejectedValue(
        new VeiculoNaoEncontradoException('sumiu'),
      );

      await expect(controller.buscar('sumiu')).rejects.toThrow(
        VeiculoNaoEncontradoException,
      );
    });
  });

  describe('PATCH /veiculos/:id', () => {
    it('combina o id da rota com o body', async () => {
      const { controller, atualizar } = montar();
      atualizar.executar.mockResolvedValue(veiculo('v1', 'XYZ4321'));

      const dto = await controller.atualizarVeiculo('v1', { cor: 'Prata' });

      expect(atualizar.executar).toHaveBeenCalledWith({
        veiculoId: 'v1',
        cor: 'Prata',
      });
      expect(dto.placa).toBe('XYZ4321');
    });
  });

  describe('DELETE /veiculos/:id', () => {
    it('delega a remoção e resolve sem corpo', async () => {
      const { controller, remover } = montar();
      remover.executar.mockResolvedValue(undefined);

      await expect(controller.removerVeiculo('v1')).resolves.toBeUndefined();
      expect(remover.executar).toHaveBeenCalledWith('v1');
    });

    it('propaga erro quando o veículo não existe', async () => {
      const { controller, remover } = montar();
      remover.executar.mockRejectedValue(
        new VeiculoNaoEncontradoException('sumiu'),
      );

      await expect(controller.removerVeiculo('sumiu')).rejects.toThrow(
        VeiculoNaoEncontradoException,
      );
    });
  });
});
