import { DocumentoInvalidoException } from '../exceptions/documento-invalido.exception';
import { DocumentoCliente } from './documento-cliente.vo';
import { TipoCliente } from './tipo-cliente.vo';

describe('DocumentoCliente', () => {
  it('aceita CPF válido para pessoa_fisica', () => {
    const doc = DocumentoCliente.criar(
      '111.444.777-35',
      TipoCliente.pessoaFisica(),
    );
    expect(doc.numero).toBe('111.444.777-35');
  });

  it('recusa CPF inválido para pessoa_fisica', () => {
    expect(() =>
      DocumentoCliente.criar('111.111.111-11', TipoCliente.pessoaFisica()),
    ).toThrow(DocumentoInvalidoException);
  });

  it('aceita CNPJ válido para pessoa_juridica', () => {
    // CNPJ válido de exemplo
    const doc = DocumentoCliente.criar(
      '11.222.333/0001-81',
      TipoCliente.pessoaJuridica(),
    );
    expect(doc.numero).toBe('11.222.333/0001-81');
  });

  it('recusa CNPJ inválido para pessoa_juridica', () => {
    expect(() =>
      DocumentoCliente.criar(
        '11.111.111/1111-11',
        TipoCliente.pessoaJuridica(),
      ),
    ).toThrow(DocumentoInvalidoException);
  });

  it('reconstitui sem revalidar (para hidratação da persistência)', () => {
    const doc = DocumentoCliente.reconstituir('qualquer-coisa');
    expect(doc.numero).toBe('qualquer-coisa');
  });

  it('confere documento ignorando máscara', () => {
    const doc = DocumentoCliente.reconstituir('111.444.777-35');
    expect(doc.confereCom('11144477735')).toBe(true);
    expect(doc.confereCom('99999999999')).toBe(false);
  });
});
