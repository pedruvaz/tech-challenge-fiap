import { OrdemServicoView } from '../../domain/repositories/ordem-servico.view';
import { OrdemServicoPresenter } from './ordem-servico.presenter';

const view = (over: Partial<OrdemServicoView> = {}): OrdemServicoView => ({
  osId: 'os-1',
  usuarioId: 1,
  clienteId: 'c1',
  veiculoId: 'v1',
  status: 'recebida',
  valorFinal: 0,
  criadoEm: new Date('2024-01-01T00:00:00Z'),
  atualizadoEm: new Date('2024-02-01T00:00:00Z'),
  deletadoEm: null,
  mecanico: null,
  cliente: null,
  veiculo: null,
  servicosRealizados: [],
  pecasUtilizadas: [],
  insumosConsumidos: [],
  ...over,
});

describe('OrdemServicoPresenter', () => {
  it('copia os campos escalares da view para o DTO', () => {
    const dto = OrdemServicoPresenter.apresentar(
      view({ status: 'em_execucao', valorFinal: 250.5 }),
    );

    expect(dto).toMatchObject({
      osId: 'os-1',
      usuarioId: 1,
      clienteId: 'c1',
      veiculoId: 'v1',
      status: 'em_execucao',
      valorFinal: 250.5,
      deletadoEm: null,
    });
  });

  it('omite mecânico, cliente e veículo quando a view não os traz', () => {
    const dto = OrdemServicoPresenter.apresentar(view());

    expect(dto.mecanico).toBeUndefined();
    expect(dto.cliente).toBeUndefined();
    expect(dto.veiculo).toBeUndefined();
  });

  it('inclui os agregados hidratados quando presentes', () => {
    const dto = OrdemServicoPresenter.apresentar(
      view({
        mecanico: { idUsuario: 3, nome: 'Carlos' },
        cliente: {
          clienteId: 'c1',
          nome: 'Maria',
          numDocumento: '111.444.777-35',
        },
        veiculo: {
          veiculoId: 'v1',
          placa: 'ABC1D23',
          marca: 'Toyota',
          modelo: 'Corolla',
        },
      }),
    );

    expect(dto.mecanico).toEqual({ idUsuario: 3, nome: 'Carlos' });
    expect(dto.cliente?.nome).toBe('Maria');
    expect(dto.veiculo?.placa).toBe('ABC1D23');
  });

  it('repassa as linhas de serviços, peças e insumos', () => {
    const dto = OrdemServicoPresenter.apresentar(
      view({
        servicosRealizados: [
          {
            servicoId: 1,
            descricao: 'Troca de óleo',
            quantidade: 1,
            valor: 120,
          },
        ],
        pecasUtilizadas: [
          { pecaId: 2, nome: 'Filtro de óleo', qtd: 2, valor: 39.9 },
        ],
        insumosConsumidos: [
          { insumoId: 3, nome: 'Óleo 5W30', qtdConsumida: 4, valor: 45 },
        ],
      }),
    );

    expect(dto.servicosRealizados).toHaveLength(1);
    expect(dto.pecasUtilizadas?.[0].nome).toBe('Filtro de óleo');
    expect(dto.insumosConsumidos?.[0].qtdConsumida).toBe(4);
  });

  it('preserva deletadoEm de OS removidas', () => {
    const deletadoEm = new Date('2024-03-01T00:00:00Z');

    expect(
      OrdemServicoPresenter.apresentar(view({ deletadoEm })).deletadoEm,
    ).toEqual(deletadoEm);
  });

  it('apresenta listas preservando a ordem', () => {
    const dtos = OrdemServicoPresenter.apresentarLista([
      view({ osId: 'os-1' }),
      view({ osId: 'os-2' }),
    ]);

    expect(dtos.map((d) => d.osId)).toEqual(['os-1', 'os-2']);
  });

  it('apresenta lista vazia', () => {
    expect(OrdemServicoPresenter.apresentarLista([])).toEqual([]);
  });
});
