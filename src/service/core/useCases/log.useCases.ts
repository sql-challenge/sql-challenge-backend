import { Log } from "../domain/log.entity";
import { ILogPort } from "../ports/log.port";

export class LogUseCase {
    constructor(private logPort: ILogPort) {}

    async getAll(): Promise<Log[]> {
        return await this.logPort.getAll();
    }

    async getById(id: number): Promise<Log> {
        return await this.logPort.getById(id);
    }
}
