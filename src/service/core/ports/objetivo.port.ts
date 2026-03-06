import { Objetivo } from "../domain/objetivo.entity";

export interface IObjetivoPort {
    getAll(): Promise<Objetivo[]>;
    getById(id: number): Promise<Objetivo>;
    getByCapituloId(capituloId: number): Promise<Objetivo[]>;
}
