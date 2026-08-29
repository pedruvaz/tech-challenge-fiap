import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { DomainExceptionFilter } from './domain-exception.filter';

class NaoEncontrado extends DomainException {
  readonly kind = 'NOT_FOUND' as const;
  constructor() {
    super('recurso sumiu');
  }
}
class EntradaInvalida extends DomainException {
  readonly kind = 'INVALID_INPUT' as const;
  constructor() {
    super('entrada ruim');
  }
}
class Conflito extends DomainException {
  readonly kind = 'CONFLICT' as const;
  constructor() {
    super('já existe');
  }
}
class Proibido extends DomainException {
  readonly kind = 'FORBIDDEN' as const;
  constructor() {
    super('sem permissão');
  }
}
class NaoAutorizado extends DomainException {
  readonly kind = 'UNAUTHORIZED' as const;
  constructor() {
    super('sem token');
  }
}

function montar() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;

  return { filtro: new DomainExceptionFilter(), host, status, json };
}

describe('DomainExceptionFilter', () => {
  it.each([
    [new NaoEncontrado(), HttpStatus.NOT_FOUND],
    [new EntradaInvalida(), HttpStatus.BAD_REQUEST],
    [new Conflito(), HttpStatus.CONFLICT],
    [new Proibido(), HttpStatus.FORBIDDEN],
    [new NaoAutorizado(), HttpStatus.UNAUTHORIZED],
  ])('mapeia %s para o status HTTP correspondente', (erro, esperado) => {
    const { filtro, host, status } = montar();

    filtro.catch(erro, host);

    expect(status).toHaveBeenCalledWith(esperado);
  });

  it('devolve statusCode, nome da exceção e mensagem no corpo', () => {
    const { filtro, host, json } = montar();

    filtro.catch(new NaoEncontrado(), host);

    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      error: 'NaoEncontrado',
      message: 'recurso sumiu',
    });
  });
});
