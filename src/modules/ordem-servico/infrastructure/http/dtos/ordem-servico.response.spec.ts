// O contrato Swagger da OS depende de thunks `type: () => Dto` para os tipos
// aninhados (evitam ciclo de import). Estes testes disparam esses thunks e
// travam a forma exposta no /docs — se alguém trocar o tipo aninhado, quebra.
import {
  ClienteResumoDto,
  InsumoConsumidoResponseDto,
  MecanicoResumoDto,
  OrdemServicoResponseDto,
  PecaUtilizadaResponseDto,
  ServicoRealizadoResponseDto,
  VeiculoResumoDto,
} from './ordem-servico.response';

type OpcoesApiProperty = { type?: () => unknown; isArray?: boolean };

const opcoesDe = (propriedade: string): OpcoesApiProperty =>
  (Reflect.getMetadata(
    `swagger/apiModelProperties`,
    OrdemServicoResponseDto.prototype,
    propriedade,
  ) ?? {}) as OpcoesApiProperty;

const tipoResolvido = (propriedade: string): unknown => {
  const { type } = opcoesDe(propriedade);
  expect(typeof type).toBe('function');
  return (type as () => unknown)();
};

describe('OrdemServicoResponseDto (contrato Swagger)', () => {
  it.each([
    ['mecanico', MecanicoResumoDto],
    ['cliente', ClienteResumoDto],
    ['veiculo', VeiculoResumoDto],
  ])('resolve %s para o DTO de resumo correspondente', (prop, esperado) => {
    expect(tipoResolvido(prop)).toBe(esperado);
  });

  it.each([
    ['servicosRealizados', ServicoRealizadoResponseDto],
    ['pecasUtilizadas', PecaUtilizadaResponseDto],
    ['insumosConsumidos', InsumoConsumidoResponseDto],
  ])('expõe %s como array do DTO de linha', (prop, esperado) => {
    expect(tipoResolvido(prop)).toEqual([esperado]);
  });

  it('aceita ser preenchido com o payload completo da OS', () => {
    const dto = new OrdemServicoResponseDto();
    dto.osId = 'os-1';
    dto.usuarioId = 1;
    dto.clienteId = 'c1';
    dto.veiculoId = 'v1';
    dto.status = 'em_execucao';
    dto.valorFinal = 250.5;
    dto.criadoEm = new Date('2024-01-01T00:00:00Z');
    dto.atualizadoEm = new Date('2024-02-01T00:00:00Z');
    dto.deletadoEm = null;

    expect(dto.osId).toBe('os-1');
    expect(dto.valorFinal).toBe(250.5);
    expect(dto.deletadoEm).toBeNull();
  });

  it('permite os agregados opcionais ausentes', () => {
    const dto = new OrdemServicoResponseDto();

    expect(dto.mecanico).toBeUndefined();
    expect(dto.cliente).toBeUndefined();
    expect(dto.veiculo).toBeUndefined();
  });
});
