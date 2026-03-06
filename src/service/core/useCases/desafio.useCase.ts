import { Capitulo } from "../domain/capitulo.entity";
import { Desafio } from "../domain/desafio.entity";
import { IDesafioPort } from "../ports/desafio.port";

export class DesafioUseCase {
    constructor(private desafioPort: IDesafioPort) {}

    async getAll(): Promise<Desafio[]> {
        return await this.desafioPort.getAll();
    }

    async getById(id: number): Promise<Desafio> {
        return await this.desafioPort.getById(id);
    }

    async getWithCapitulo(id: number, capituloId: number): Promise<Desafio & Capitulo> {
        return await this.desafioPort.getWithCapitulo(id, capituloId);
    }
}
