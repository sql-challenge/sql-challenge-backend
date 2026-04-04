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

	async getByCapituloId(idCapitulo: number): Promise<Visao[]> {
		return await this.visaoPort.getByCapituloId(idCapitulo);
	}

	async executeViewById(id: number): Promise<Record<string, unknown>[]> {
		const visao = await this.visaoPort.getById(id);
		return await this.visaoPort.executeView(visao.comando);
	}
}
