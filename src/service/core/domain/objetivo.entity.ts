export class Objetivo {
    private id: number;
    private id_desafio: number;
    private descricao: string;

    constructor(
        id: number,
        id_desafio: number,
        descricao: string
    ) {
        this.id = id;
        this.id_desafio = id_desafio;
        this.descricao = descricao;
    }
}
