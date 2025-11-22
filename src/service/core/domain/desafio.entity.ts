export class Desafio {
    private id: number;
    private id_capitulo: number;
    private descricao: string;
    private numero: number;

    constructor(
        id: number,
        id_capitulo: number,
        descricao: string,
        numero: number
    ) {
        this.id = id;
        this.id_capitulo = id_capitulo;
        this.descricao = descricao;
        this.numero = numero;
    }
}
