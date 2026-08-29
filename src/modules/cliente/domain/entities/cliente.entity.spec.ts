import { DocumentoInvalidoException } from '../exceptions/documento-invalido.exception';
import { DocumentoCliente } from '../value-objects/documento-cliente.vo';
import { TipoCliente } from '../value-objects/tipo-cliente.vo';
import { Cliente } from './cliente.entity';

function novoCliente(): Cliente {
  return Cliente.criar({
    clienteId: 'c-1',
    nome: 'João',
    telefone: '11999999999',
    numDocumento: '111.444.777-35',
    tipo: TipoCliente.pessoaFisica(),
  });
}

describe('Cliente — criação', () => {
  it('nasce marcado como criado agora', () => {
    const c = novoCliente();
    expect(c.foiCriadoAgora).toBe(true);
    expect(c.deletadoEm).toBeNull();
    expect(c.veiculos.length).toBe(0);
  });

  it('rejeita documento inválido para o tipo', () => {
    expect(() =>
      Cliente.criar({
        clienteId: 'c-1',
        nome: 'X',
        telefone: '11',
        numDocumento: '111.111.111-11',
        tipo: TipoCliente.pessoaFisica(),
      }),
    ).toThrow(DocumentoInvalidoException);
  });
});

describe('Cliente — alteração', () => {
  it('altera nome/telefone sem tocar documento', () => {
    const c = novoCliente();
    c.alterar({ nome: 'João Silva', telefone: '11888888888' });
    expect(c.nome).toBe('João Silva');
    expect(c.telefone).toBe('11888888888');
    expect(c.documento.numero).toBe('111.444.777-35');
  });

  it('revalida documento ao trocar tipo', () => {
    const c = novoCliente();
    expect(() => c.alterar({ tipo: TipoCliente.pessoaJuridica() })).toThrow(
      DocumentoInvalidoException,
    );
  });

  it('aceita novo documento coerente com novo tipo', () => {
    const c = novoCliente();
    c.alterar({
      numDocumento: '11.222.333/0001-81',
      tipo: TipoCliente.pessoaJuridica(),
    });
    expect(c.tipo.ehPessoaJuridica()).toBe(true);
    expect(c.documento.numero).toBe('11.222.333/0001-81');
  });
});

describe('Cliente — soft delete', () => {
  it('marca deletadoEm', () => {
    const c = Cliente.reconstituir({
      clienteId: 'c-1',
      nome: 'João',
      telefone: '11',
      documento: DocumentoCliente.reconstituir('111.444.777-35'),
      tipo: TipoCliente.pessoaFisica(),
      criadoEm: new Date(),
      atualizadoEm: new Date(),
      deletadoEm: null,
      veiculos: [],
    });
    c.softDelete();
    expect(c.deletadoEm).toBeInstanceOf(Date);
  });
});
