import { Cliente } from '../../domain/entities/cliente.entity';
import { VeiculoVinculado } from '../../domain/entities/veiculo-vinculado.entity';
import { DocumentoCliente } from '../../domain/value-objects/documento-cliente.vo';
import { TipoCliente } from '../../domain/value-objects/tipo-cliente.vo';
import { ClientePresenter } from './cliente.presenter';

const semVeiculos = (clienteId = 'c1'): Cliente =>
  Cliente.criar({
    clienteId,
    nome: 'Maria',
    telefone: '11999999999',
    numDocumento: '111.444.777-35',
    tipo: TipoCliente.pessoaFisica(),
  });

const comVeiculos = (veiculos: VeiculoVinculado[]): Cliente =>
  Cliente.reconstituir({
    clienteId: 'c1',
    nome: 'Maria',
    telefone: '11999999999',
    documento: DocumentoCliente.reconstituir('111.444.777-35'),
    tipo: TipoCliente.pessoaFisica(),
    criadoEm: new Date('2024-01-01T00:00:00Z'),
    atualizadoEm: new Date('2024-02-01T00:00:00Z'),
    deletadoEm: null,
    veiculos,
  });

describe('ClientePresenter', () => {
  it('achata documento e tipo em valores primitivos', () => {
    const dto = ClientePresenter.apresentar(semVeiculos());

    expect(dto).toMatchObject({
      clienteId: 'c1',
      nome: 'Maria',
      telefone: '11999999999',
      numDocumento: '111.444.777-35',
      tipo: 'pessoa_fisica',
    });
  });

  it('devolve veiculos como array vazio quando o cliente não tem nenhum', () => {
    expect(ClientePresenter.apresentar(semVeiculos()).veiculos).toEqual([]);
  });

  it('projeta os veículos vinculados como objetos planos', () => {
    const criadoEm = new Date('2024-01-01T00:00:00Z');
    const cliente = comVeiculos([
      new VeiculoVinculado(
        'v1',
        'ABC1D23',
        'Toyota',
        'Corolla',
        '2020',
        'Preto',
        criadoEm,
        criadoEm,
        null,
      ),
    ]);

    const dto = ClientePresenter.apresentar(cliente);

    expect(dto.veiculos).toEqual([
      {
        veiculoId: 'v1',
        placa: 'ABC1D23',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: '2020',
        cor: 'Preto',
        criadoEm,
        atualizadoEm: criadoEm,
        deletadoEm: null,
      },
    ]);
    expect(dto.veiculos[0]).not.toBeInstanceOf(VeiculoVinculado);
  });

  it('apresenta listas preservando a ordem', () => {
    const dtos = ClientePresenter.apresentarLista([
      semVeiculos('c1'),
      semVeiculos('c2'),
    ]);

    expect(dtos.map((d) => d.clienteId)).toEqual(['c1', 'c2']);
  });

  it('apresenta lista vazia', () => {
    expect(ClientePresenter.apresentarLista([])).toEqual([]);
  });
});
