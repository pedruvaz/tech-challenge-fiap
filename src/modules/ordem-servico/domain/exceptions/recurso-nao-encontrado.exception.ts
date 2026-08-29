import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class MecanicoNaoEncontradoException extends DomainException {
  readonly kind = 'NOT_FOUND' as const;
  constructor(id: number) {
    super(`Mecânico '${id}' não encontrado`);
  }
}

export class ClienteNaoEncontradoException extends DomainException {
  readonly kind = 'NOT_FOUND' as const;
  constructor(id: string) {
    super(`Cliente '${id}' não encontrado`);
  }
}

export class VeiculoNaoEncontradoException extends DomainException {
  readonly kind = 'NOT_FOUND' as const;
  constructor(id: string) {
    super(`Veículo '${id}' não encontrado`);
  }
}

export class ServicoNaoEncontradoException extends DomainException {
  readonly kind = 'NOT_FOUND' as const;
  constructor(id: number) {
    super(`Serviço '${id}' não encontrado`);
  }
}

export class PecaNaoEncontradaException extends DomainException {
  readonly kind = 'NOT_FOUND' as const;
  constructor(id: number) {
    super(`Peça '${id}' não encontrada`);
  }
}

export class InsumoNaoEncontradoException extends DomainException {
  readonly kind = 'NOT_FOUND' as const;
  constructor(id: number) {
    super(`Insumo '${id}' não encontrado`);
  }
}

export class ServicoNaoAssociadoException extends DomainException {
  readonly kind = 'NOT_FOUND' as const;
  constructor(servicoId: number, osId: string) {
    super(
      `Serviço '${servicoId}' não encontrado na ordem de serviço '${osId}'`,
    );
  }
}

export class PecaNaoAssociadaException extends DomainException {
  readonly kind = 'NOT_FOUND' as const;
  constructor(pecaId: number, osId: string) {
    super(`Peça '${pecaId}' não encontrada na ordem de serviço '${osId}'`);
  }
}

export class InsumoNaoAssociadoException extends DomainException {
  readonly kind = 'NOT_FOUND' as const;
  constructor(insumoId: number, osId: string) {
    super(`Insumo '${insumoId}' não encontrado na ordem de serviço '${osId}'`);
  }
}
