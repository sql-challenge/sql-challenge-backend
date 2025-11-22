// src/core/useCases/capitulo.useCase.ts

import { Capitulo } from "../domain/capitulo.entity";
import { ICapituloPort } from "../ports/capitulo.port";

export class CapituloUseCase {
    constructor(private capPort: ICapituloPort) {}

    async getAll(): Promise<Capitulo[]> {
        return await this.capPort.getAll();
    }

    async getById(id: number): Promise<Capitulo> {
        return await this.capPort.getById(id);
    }
}
