export class Log {
    private id: number;
    private id_desafio: number;
    private id_usuario: string;
    private acao: string; // B
    private data: string;

    constructor(
        id: number,
        id_desafio: number,
        id_usuario: string,
        acao: string,
        data: string
    ) {
        this.id = id;
        this.id_desafio = id_desafio;
        this.id_usuario = id_usuario;
        this.acao = acao;
        this.data = data;
    }
}
