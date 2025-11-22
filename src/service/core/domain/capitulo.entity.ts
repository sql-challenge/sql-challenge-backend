// src/core/domain/capitulo.entity.ts

export class Capitulo {
    private id: number;
    private id_topico: number;
    private id_nivel: number;
    private id_visao: number;
    private descricao: string;
    private numero: number;
    private titulo: string;
    private nivelmaximo: number;

    constructor(
        id: number,
        id_topico: number,
        id_nivel: number,
        id_visao: number,
        descricao: string,
        numero: number,
        titulo: string,
        nivelmaximo: number
    ) {
        this.id = id;
        this.id_topico = id_topico;
        this.id_nivel = id_nivel;
        this.id_visao = id_visao;
        this.descricao = descricao;
        this.numero = numero;
        this.titulo = titulo;
        this.nivelmaximo = nivelmaximo;
    }
}
