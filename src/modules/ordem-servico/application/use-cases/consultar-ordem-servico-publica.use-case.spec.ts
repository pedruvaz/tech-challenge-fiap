import { Cliente } from '../../domain/entities/cliente.entity';
import { OrdemServico } from '../../domain/entities/ordem-servico.entity';
import { DocumentoNaoConfereException } from '../../domain/exceptions/documento-nao-confere.exception';
import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import { ClienteRepository } from '../../domain/repositories/cliente.repository';
import { OrdemServicoRepository } from '../../domain/repositories/ordem-servico.repository';
import { ConsultarOrdemServicoPublicaUseCase } from './consultar-ordem-servico-publica.use-case';

class OsRepoFake implements OrdemServicoRepository {
  constructor(private os: OrdemServico | null) {}
  salvar = async () => undefined;
  buscarPorId = async () => this.os;
  listar = async () => [] as OrdemServico[];
  tempoMedioExecucaoMs = async () => 0;
}

class ClienteRepoFake implements ClienteRepository {
  constructor(private c: Cliente | null) {}
  buscarPorId = async () => this.c;
}

const os = OrdemServico.criar({
  osId: 'os-1',
  mecanicoId: 1,
  clienteId: 'c1',
  veiculoId: 'v1',
});

describe('ConsultarOrdemServicoPublicaUseCase', () => {
  it('lança se OS não existe', async () => {
    const uc = new ConsultarOrdemServicoPublicaUseCase(
      new OsRepoFake(null),
      new ClienteRepoFake(null),
    );
    await expect(
      uc.executar({ osId: 'x', numDocumento: '111' }),
    ).rejects.toBeInstanceOf(OsNaoEncontradaException);
  });

  it('lança se cliente sumiu ou documento diverge', async () => {
    const uc = new ConsultarOrdemServicoPublicaUseCase(
      new OsRepoFake(os),
      new ClienteRepoFake(new Cliente('c1', 'A', '999')),
    );
    await expect(
      uc.executar({ osId: 'os-1', numDocumento: '111' }),
    ).rejects.toBeInstanceOf(DocumentoNaoConfereException);
  });

  it('devolve a OS quando o documento confere (ignorando máscara)', async () => {
    const uc = new ConsultarOrdemServicoPublicaUseCase(
      new OsRepoFake(os),
      new ClienteRepoFake(new Cliente('c1', 'A', '111.222.333-44')),
    );
    const result = await uc.executar({
      osId: 'os-1',
      numDocumento: '11122233344',
    });
    expect(result).toBe(os);
  });
});
