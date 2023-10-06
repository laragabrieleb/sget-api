import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"

//representa a tabela usuarios no banco de dados
@Entity("usuarios")
export class Usuarios {

    @PrimaryColumn()
    id: number

    //as colunas devem ser mapeadas iguais ao banco de dados 
    @Column("varchar", { length: 45 })
    nome: string

    @Column("varchar", { length: 45 })
    matricula: string

    @Column("varchar", { length: 300 })
    senha: string

    @Column("timestamp")
    datacriacao: Date

    @Column("bool")
    situacao: boolean

    @Column("varchar", { length: 20 })
    criadopor: string
}
