import { Peca } from '../../domain/entities/peca.entity';
import { PecaRepository } from '../../domain/repositories/peca.repository';

export class ListarPecasUseCase {
  constructor(private readonly repo: PecaRepository) {}

  executar(): Promise<Peca[]> {
    return this.repo.listar();
  }
}
