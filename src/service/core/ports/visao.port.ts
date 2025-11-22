import { Visao } from "../domain/visao.entity";

export interface IVisaoPort {
	getAll(): Promise<Visao[]>;
	getById(id: number): Promise<Visao>;
}
