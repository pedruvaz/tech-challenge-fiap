import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('insumo')
export class Insumo {
    @PrimaryGeneratedColumn()
    insumo_id: number;

    @Column({ type: 'varchar', length: 100 })
    nome: string;

    @Column({ type: "int" })
    qtd_estoque: number;

    @Column({ type: 'decimal' })
    valorUn: number;

    // constructor(insumo_id = 0, nome = '', qtd_estoque = 0, valorUn = 0) {
    //     this.insumo_id = insumo_id;
    //     this.nome = nome;
    //     this.qtd_estoque = qtd_estoque;
    //     this.valorUn = valorUn;
    // }
}
