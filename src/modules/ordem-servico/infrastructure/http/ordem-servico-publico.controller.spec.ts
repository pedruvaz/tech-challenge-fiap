import { BadRequestException } from '@nestjs/common';
import { ConsultarOrdemServicoPublicaUseCase } from '../../application/use-cases/consultar-ordem-servico-publica.use-case';
import { DocumentoNaoConfereException } from '../../domain/exceptions/documento-nao-confere.exception';
import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import {
  OrdemServicoView,
  OrdemServicoViewRepository,
} from '../../domain/repositories/ordem-servico.view';
import { OrdemServicoPublicoController } from './ordem-servico-publico.controller';

const OS_ID = 'd290f1ee-6c54-4b01-90e6-d701748f0851';
const DOC = '111.444.777-35';

const view = (): OrdemServicoView => ({
  osId: OS_ID,
  usuarioId: 1,
  clienteId: 'c1',
  veiculoId: 'v1',
  status: 'aguardando_aprovacao',
  valorFinal: 250,
  criadoEm: new Date('2024-01-01T00:00:00Z'),
  atualizadoEm: new Date('2024-02-01T00:00:00Z'),
  deletadoEm: null,
  mecanico: null,
  cliente: null,
  veiculo: null,
  servicosRealizados: [],
  pecasUtilizadas: [],
  insumosConsumidos: [],
});

function montar() {
  const consultar = { executar: jest.fn().mockResolvedValue(undefined) };
  const viewRepo = { buscarPorId: jest.fn().mockResolvedValue(view()) };

  const controller = new OrdemServicoPublicoController(
    consultar as unknown as ConsultarOrdemServicoPublicaUseCase,
    viewRepo as unknown as OrdemServicoViewRepository,
  );

  return { controller, consultar, viewRepo };
}

describe('OrdemServicoPublicoController', () => {
  it('exige o documento como prova de posse', async () => {
    const { controller, consultar } = montar();

    await expect(controller.buscar(OS_ID)).rejects.toThrow(BadRequestException);
    expect(consultar.executar).not.toHaveBeenCalled();
  });

  it.each(['', '   ', '\t'])(
    'recusa documento em branco (%p)',
    async (numDocumento) => {
      const { controller } = montar();

      await expect(controller.buscar(OS_ID, numDocumento)).rejects.toThrow(
        "Query 'numDocumento' é obrigatória",
      );
    },
  );

  it('valida a posse antes de projetar a OS', async () => {
    const { controller, consultar, viewRepo } = montar();

    const dto = await controller.buscar(OS_ID, DOC);

    expect(consultar.executar).toHaveBeenCalledWith({
      osId: OS_ID,
      numDocumento: DOC,
    });
    expect(viewRepo.buscarPorId).toHaveBeenCalledWith(OS_ID);
    expect(dto.osId).toBe(OS_ID);
    expect(dto.valorFinal).toBe(250);
  });

  it('propaga a recusa do use-case quando o documento não confere', async () => {
    const { controller, consultar, viewRepo } = montar();
    consultar.executar.mockRejectedValue(new DocumentoNaoConfereException());

    await expect(controller.buscar(OS_ID, '000.000.000-00')).rejects.toThrow(
      DocumentoNaoConfereException,
    );
    expect(viewRepo.buscarPorId).not.toHaveBeenCalled();
  });

  it('lança OsNaoEncontradaException quando a view não devolve nada', async () => {
    const { controller, viewRepo } = montar();
    viewRepo.buscarPorId.mockResolvedValue(null);

    await expect(controller.buscar(OS_ID, DOC)).rejects.toThrow(
      OsNaoEncontradaException,
    );
  });
});
