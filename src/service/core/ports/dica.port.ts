import { Dica } from "../domain/dica.entity";

export interface IDicaPort {
    getAll(): Promise<Dica[]>;
    getById(id: number): Promise<Dica>;
    getByCapituloId(idCapitulo: number): Promise<Dica[]>;
}
