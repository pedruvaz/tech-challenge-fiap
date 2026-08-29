import { clienteInclude, reconstituirCliente } from './cliente.mapper';

const veiculoRaw = (veiculoId = 'v1', placa = 'ABC1D23') => ({
  veiculo: {
    veiculoId,
    placa,
    marca: 'Toyota',
    modelo: 'Corolla',
    ano: '2020',
    cor: 'Preto',
    criadoEm: new Date('2024-01-01T00:00:00Z'),
    atualizadoEm: new Date('2024-02-01T00:00:00Z'),
    deletadoEm: null,
  },
});

const raw = (over: Record<string, unknown> = {}) =>
  ({
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
  }) as unknown as Parameters<typeof reconstituirCliente>[0];

describe('cliente.mapper', () => {
  it('clienteInclude filtra veículos com soft delete', () => {
    expect(clienteInclude.veiculos.where).toEqual({
      veiculo: { deletadoEm: null },
    });
    expect(clienteInclude.veiculos.include).toEqual({ veiculo: true });
  });

  it('mapeia a linha do Prisma para a entidade de domínio', () => {
    const cliente = reconstituirCliente(raw());

    expect(cliente.clienteId).toBe('c1');
    expect(cliente.nome).toBe('Maria');
    expect(cliente.telefone).toBe('11999999999');
    expect(cliente.documento.numero).toBe('111.444.777-35');
    expect(cliente.tipo.ehPessoaFisica()).toBe(true);
    expect(cliente.foiCriadoAgora).toBe(false);
    expect(cliente.veiculos).toEqual([]);
  });

  it('reconstitui pessoa jurídica a partir da coluna tipo', () => {
    const cliente = reconstituirCliente(
      raw({ tipo: 'pessoa_juridica', numDocumento: '11.222.333/0001-81' }),
    );

    expect(cliente.tipo.ehPessoaJuridica()).toBe(true);
  });

  it('hidrata os veículos vinculados a partir da tabela de junção', () => {
    const cliente = reconstituirCliente(
      raw({ veiculos: [veiculoRaw('v1'), veiculoRaw('v2', 'XYZ4321')] }),
    );

    expect(cliente.veiculos.map((v) => v.veiculoId)).toEqual(['v1', 'v2']);
    expect(cliente.veiculos[1].placa).toBe('XYZ4321');
  });

  it('propaga deletadoEm de clientes com soft delete', () => {
    const deletadoEm = new Date('2024-03-01T00:00:00Z');

    expect(reconstituirCliente(raw({ deletadoEm })).deletadoEm).toEqual(
      deletadoEm,
    );
  });
});
