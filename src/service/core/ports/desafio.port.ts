import { Capitulo } from "../domain/capitulo.entity";
import { Desafio } from "../domain/desafio.entity";

export interface IDesafioPort {
    getAll(): Promise<Desafio[]>;
    getById(id: number): Promise<Desafio>;
    getWithCapitulo(id: number, categoryId: number): Promise<Desafio & Capitulo>;
}
