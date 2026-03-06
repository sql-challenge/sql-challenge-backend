// src/core/domain/capitulo.entity.ts

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
