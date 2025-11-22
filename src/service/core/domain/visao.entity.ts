export class Visao {
	private id: number;
	private comando: string;

	constructor(id: number, comando: string) {
		if (!comando) throw new Error("Comando é obrigatório");
		this.id = id;
		this.comando = comando;
	}

	getId() {
		return this.id;
	}

	getComando() {
		return this.comando;
	}
}
