// Read model do veículo vinculado ao cliente. Usado para hidratação e
// projeção de resposta; o domínio próprio de Veículo virá em outro módulo.
export class VeiculoVinculado {
  constructor(
    readonly veiculoId: string,
    readonly placa: string,
    readonly marca: string,
    readonly modelo: string,
    readonly ano: string,
    readonly cor: string,
    readonly criadoEm: Date,
    readonly atualizadoEm: Date,
    readonly deletadoEm: Date | null,
  ) {}
}
