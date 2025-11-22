import { Log } from "../domain/log.entity";

export interface ILogPort {
    getAll(): Promise<Log[]>;
    getById(id: number): Promise<Log>;
}
