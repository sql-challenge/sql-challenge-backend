// src/core/domain/capitulo.entity.ts

import { Consulta } from "./consulta.entity";
import { Dica } from "./dica.entity";
import { Objetivo } from "./objetivo.entity";

export class Capitulo {
    constructor(
        public id: number,
        public idDesafio: number,
        public introHistoria: string,
        public xp_recompensa: number,
        public contextoHistoria: string,
        public numero: number
    ) {}
}

export interface CapituloView {
    capitulo: Capitulo;
    objetivos: Objetivo[];
    dicas: Dica[];
    consultaSolucao: Consulta;
}
