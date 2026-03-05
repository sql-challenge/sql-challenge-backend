import { Dica } from "../domain/dica.entity";
import { IDicaPort } from "../ports/dica.port";

export class DicaUseCase {
    constructor(private dicaPort: IDicaPort) {}

    async getAll(): Promise<Dica[]> {
        return await this.dicaPort.getAll();
    }

    async getById(id: number): Promise<Dica> {
        return await this.dicaPort.getById(id);
    }

    async getByCapituloId(idCapitulo: number): Promise<Dica[]> {
        return await this.dicaPort.getByCapituloId(idCapitulo);
    }
}
