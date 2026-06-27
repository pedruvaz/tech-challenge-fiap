import { Prisma, Status } from '@prisma/client';
import { OrdemServicoResponseDto } from '../dto/ordem-servico-response.dto';

const baseOs = {
  osId: 'os-uuid-1',
  usuarioId: 1,
  clienteId: 'cliente-uuid',
  veiculoId: 'veiculo-uuid',
  status: 'em_execucao' as Status,
  valorFinal: new Prisma.Decimal('160.00'),
  criadoEm: new Date('2026-01-01T10:00:00Z'),
  atualizadoEm: new Date('2026-01-01T12:00:00Z'),
  deletadoEm: null,
};

describe('OrdemServicoResponseDto', () => {
  it('mapeia relações e itens aninhados', () => {
    const dto = new OrdemServicoResponseDto({
      ...baseOs,
      mecanico: { idUsuario: 1, nome: 'Mecânico' },
      cliente: {
        clienteId: 'cliente-uuid',
        nome: 'Cliente',
        numDocumento: '1',
      },
      veiculo: {
        veiculoId: 'veiculo-uuid',
        placa: 'ABC-1234',
        marca: 'Toyota',
        modelo: 'Corolla',
      },
      servicosRealizados: [
        {
          servicoId: 1,
          quantidade: 2,
          valor: new Prisma.Decimal('80'),
          servico: { descricao: 'Troca de Óleo' },
        },
      ],
      pecasUtilizadas: [
        {
          pecaId: 1,
          qtd: 1,
          valor: new Prisma.Decimal('35.90'),
          peca: { nome: 'Filtro' },
        },
      ],
      insumosConsumidos: [
        {
          insumoId: 1,
          qtdConsumida: 3,
          valor: new Prisma.Decimal('28.50'),
          insumo: { nome: 'Óleo' },
        },
      ],
    });

    expect(dto.valorFinal).toBe(160);
    expect(dto.mecanico).toEqual({ idUsuario: 1, nome: 'Mecânico' });
    expect(dto.servicosRealizados).toEqual([
      { servicoId: 1, descricao: 'Troca de Óleo', quantidade: 2, valor: 80 },
    ]);
    expect(dto.pecasUtilizadas).toEqual([
      { pecaId: 1, nome: 'Filtro', qtd: 1, valor: 35.9 },
    ]);
    expect(dto.insumosConsumidos).toEqual([
      { insumoId: 1, nome: 'Óleo', qtdConsumida: 3, valor: 28.5 },
    ]);
  });

  it('usa defaults quando relações de item estão ausentes', () => {
    const dto = new OrdemServicoResponseDto({
      ...baseOs,
      valorFinal: 0,
      servicosRealizados: [{ servicoId: 1, quantidade: 1, valor: 80 }],
      pecasUtilizadas: [{ pecaId: 1, qtd: 1, valor: 35.9 }],
      insumosConsumidos: [{ insumoId: 1, qtdConsumida: 1, valor: 28.5 }],
    });

    expect(dto.servicosRealizados?.[0].descricao).toBe('');
    expect(dto.pecasUtilizadas?.[0].nome).toBe('');
    expect(dto.insumosConsumidos?.[0].nome).toBe('');
    // sem mecânico/cliente/veículo, os campos opcionais ficam indefinidos
    expect(dto.mecanico).toBeUndefined();
    expect(dto.cliente).toBeUndefined();
    expect(dto.veiculo).toBeUndefined();
    expect(dto.deletadoEm).toBeNull();
  });
});
