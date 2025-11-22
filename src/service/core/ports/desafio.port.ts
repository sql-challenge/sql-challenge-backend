import { Desafio } from "../domain/desafio.entity";

export interface IDesafioPort {
    getAll(): Promise<Desafio[]>;
    getById(id: number): Promise<Desafio>;
}
