import { Column, PrimaryGeneratedColumn } from "typeorm";

export class Peca {
    @PrimaryGeneratedColumn()
    pecaId: number;

    @Column({ type: 'varchar', length: 100 })
    nome: string;

    @Column({ type: "int" })
    qtdEstoque: number;

    @Column({ type: 'decimal' })
    valorUn: number;
}
