// Fakes compartilhados pelos specs dos use-cases de OS. Mantidos fora dos
// arquivos .spec para evitar repetir os mesmos dublês em cada um deles.
import { Insumo } from '../../domain/entities/insumo.entity';
import { OrdemServico } from '../../domain/entities/ordem-servico.entity';
import { InsumoRepository } from '../../domain/repositories/insumo.repository';
import { OrdemServicoRepository } from '../../domain/repositories/ordem-servico.repository';
import { UnitOfWork } from '../../domain/repositories/unit-of-work';
import { Dinheiro } from '../../domain/value-objects/dinheiro.vo';

export class OsRepoFake implements OrdemServicoRepository {
  constructor(private os: OrdemServico | null) {}
  salvar = jest.fn((): Promise<void> => Promise.resolve());
  buscarPorId = jest.fn(
    (): Promise<OrdemServico | null> => Promise.resolve(this.os),
  );
  listar = jest.fn(
    (): Promise<OrdemServico[]> => Promise.resolve(this.os ? [this.os] : []),
  );
  tempoMedioExecucaoMs = jest.fn((): Promise<number> => Promise.resolve(0));
}

export class InsumoRepoFake implements InsumoRepository {
  constructor(private insumo: Insumo | null) {}
  buscarPorId = jest.fn(
    (): Promise<Insumo | null> => Promise.resolve(this.insumo),
  );
  salvar = jest.fn((): Promise<void> => Promise.resolve());
}

export class UowFake implements UnitOfWork {
  executou = false;
  executar<T>(trabalho: () => Promise<T>): Promise<T> {
    this.executou = true;
    return trabalho();
  }
}

export const novaOs = (): OrdemServico =>
  OrdemServico.criar({
    osId: 'os-1',
    mecanicoId: 1,
    clienteId: 'c1',
    veiculoId: 'v1',
  });

export const novoInsumo = (qtdEstoque: number): Insumo =>
  Insumo.reconstituir({
    insumoId: 7,
    nome: 'Óleo 5W30',
    qtdEstoque,
    valorUn: Dinheiro.deNumero(45),
  });
