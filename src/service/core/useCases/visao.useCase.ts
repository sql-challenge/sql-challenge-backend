import { IVisaoPort } from "../ports/visao.port";
import { Visao } from "../domain/visao.entity";

export class VisaoUseCase {
	constructor(private visaoPort: IVisaoPort) {}

	async getAll(): Promise<Visao[]> {
		return await this.visaoPort.getAll();
	}

	async getById(id: number): Promise<Visao> {
		return await this.visaoPort.getById(id);
	}
}
