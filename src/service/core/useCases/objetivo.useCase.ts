import { Objetivo } from "../domain/objetivo.entity";
import { IObjetivoPort } from "../ports/objetivo.port";

export class ObjetivoUseCase {
    constructor(private objPort: IObjetivoPort) {}

    async getAll(): Promise<Objetivo[]> {
        return await this.objPort.getAll();
    }

    async getById(id: number): Promise<Objetivo> {
        return await this.objPort.getById(id);
    }

    async getByCapituloId(capituloId: number): Promise<Objetivo[]> {
        return this.objPort.getByCapituloId(capituloId);
    }
}
