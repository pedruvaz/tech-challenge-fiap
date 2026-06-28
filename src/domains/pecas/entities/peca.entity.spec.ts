import { Peca } from './peca.entity';

describe('Peca', () => {
  describe('constructor', () => {
    it('deve criar uma instância válida', () => {
      const peca = new Peca('Filtro de ar', 5, 29.9);

      expect(peca.nomePeca).toBe('Filtro de ar');
      expect(peca.estoque).toBe(5);
      expect(peca.valorUnitario).toBe(29.9);
      expect(peca.id).toBeUndefined();
    });

    it('deve criar uma instância com id', () => {
      const peca = new Peca('Filtro de ar', 5, 29.9, 1);

      expect(peca.id).toBe(1);
    });

    it('deve lançar erro se o nome tiver menos de 2 caracteres', () => {
      expect(() => new Peca('A', 5, 29.9)).toThrow(
        'O nome da peça deve conter no mínimo 2 caracteres.',
      );
    });

    it('deve lançar erro se o nome estiver vazio', () => {
      expect(() => new Peca('', 5, 29.9)).toThrow(
        'O nome da peça deve conter no mínimo 2 caracteres.',
      );
    });

    it('deve lançar erro se a quantidade for negativa', () => {
      expect(() => new Peca('Filtro', -1, 29.9)).toThrow(
        'A quantidade não pode ser negativa.',
      );
    });

    it('deve lançar erro se o valor for negativo', () => {
      expect(() => new Peca('Filtro', 5, -1)).toThrow(
        'O valor unitário não pode ser negativo.',
      );
    });
  });

  describe('setNome', () => {
    it('deve alterar o nome da peça', () => {
      const peca = new Peca('Filtro de ar', 5, 29.9);
      peca.setNome('Filtro de óleo');

      expect(peca.nomePeca).toBe('Filtro de óleo');
    });

    it('deve lançar erro se o novo nome for inválido', () => {
      const peca = new Peca('Filtro de ar', 5, 29.9);

      expect(() => peca.setNome('A')).toThrow(
        'O nome da peça deve conter no mínimo 2 caracteres.',
      );
    });
  });

  describe('setValor', () => {
    it('deve alterar o valor unitário', () => {
      const peca = new Peca('Filtro', 5, 29.9);
      peca.setValor(49.9);

      expect(peca.valorUnitario).toBe(49.9);
    });

    it('deve lançar erro se o novo valor for negativo', () => {
      const peca = new Peca('Filtro', 5, 29.9);

      expect(() => peca.setValor(-10)).toThrow(
        'O valor unitário não pode ser negativo.',
      );
    });
  });

  describe('adicionarEstoque', () => {
    it('deve aumentar a quantidade em estoque', () => {
      const peca = new Peca('Filtro', 5, 29.9);
      peca.adicionarEstoque(3);

      expect(peca.estoque).toBe(8);
    });

    it('deve lançar erro se a quantidade adicionada for negativa', () => {
      const peca = new Peca('Filtro', 5, 29.9);

      expect(() => peca.adicionarEstoque(-1)).toThrow(
        'A quantidade não pode ser negativa.',
      );
    });
  });

  describe('removerEstoque', () => {
    it('deve diminuir a quantidade em estoque', () => {
      const peca = new Peca('Filtro', 5, 29.9);
      peca.removerEstoque(3);

      expect(peca.estoque).toBe(2);
    });

    it('deve lançar erro se a quantidade for negativa', () => {
      const peca = new Peca('Filtro', 5, 29.9);

      expect(() => peca.removerEstoque(-1)).toThrow(
        'A quantidade não pode ser negativa.',
      );
    });

    it('deve lançar erro se a quantidade a remover for maior que o estoque', () => {
      const peca = new Peca('Filtro', 5, 29.9);

      expect(() => peca.removerEstoque(10)).toThrow(
        'Quantidade insuficiente em estoque.',
      );
    });
  });

  describe('toPersistence', () => {
    it('deve retornar os dados para persistência', () => {
      const peca = new Peca('Filtro de ar', 5, 29.9, 1);

      expect(peca.toPersistence()).toEqual({
        pecaId: 1,
        nome: 'Filtro de ar',
        qtdEstoque: 5,
        valorUn: 29.9,
      });
    });
  });
});
