export class Peca {
  private readonly pecaId?: number;
  private nome: string;
  private qtdEstoque: number;
  private valorUn: number;

  constructor(nome: string, qtdEstoque: number, valorUn: number, pecaId?: number) {
    this.validarNome(nome);
    this.validarQuantidade(qtdEstoque);
    this.validarValor(valorUn);

    this.pecaId = pecaId;
    this.nome = nome;
    this.qtdEstoque = qtdEstoque;
    this.valorUn = valorUn;
  }

  get id(): number | undefined {
    return this.pecaId;
  }

  get nomePeca(): string {
    return this.nome;
  }

  get estoque(): number {
    return this.qtdEstoque;
  }

  get valorUnitario(): number {
    return this.valorUn;
  }

  setNome(nome: string): void {
    this.validarNome(nome);
    this.nome = nome;
  }

  setValor(valorUn: number): void {
    this.validarValor(valorUn);
    this.valorUn = valorUn;
  }

  adicionarEstoque(quantidade: number): void {
    this.validarQuantidade(quantidade);
    this.qtdEstoque += quantidade;
  }

  removerEstoque(quantidade: number): void {
    this.validarQuantidade(quantidade);

    if (quantidade > this.qtdEstoque) {
      throw new Error('Quantidade insuficiente em estoque.');
    }

    this.qtdEstoque -= quantidade;
  }

  private validarNome(nome: string): void {
    if (!nome || nome.trim().length < 2) {
      throw new Error('O nome da peça deve conter no mínimo 2 caracteres.');
    }
  }

  private validarQuantidade(quantidade: number): void {
    if (quantidade < 0) {
      throw new Error('A quantidade não pode ser negativa.');
    }
  }

  private validarValor(valor: number): void {
    if (valor < 0) {
      throw new Error('O valor unitário não pode ser negativo.');
    }
  }

  toPersistence() {
    return {
      pecaId: this.pecaId,
      nome: this.nome,
      qtdEstoque: this.qtdEstoque,
      valorUn: this.valorUn,
    };
  }
}