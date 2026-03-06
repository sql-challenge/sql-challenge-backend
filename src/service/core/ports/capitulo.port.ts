// src/core/ports/capitulo.port.ts

import { Capitulo } from "../domain/capitulo.entity";

export interface ICapituloPort {
    getAll(): Promise<Capitulo[]>;
    getById(id: number): Promise<Capitulo>;
    getByDesafioId(desafioId: number): Promise<Capitulo[]>;
}
