// src/core/ports/capitulo.port.ts

import { Capitulo } from "../domain/capitulo.entity";
import { Consulta } from "../domain/consulta.entity";
import { Dica } from "../domain/dica.entity";
import { Objetivo } from "../domain/objetivo.entity";

export interface ICapituloPort {
    getAll(): Promise<Capitulo[]>;
    getById(id: number): Promise<Capitulo>;
    getByDesafioId(desafioId: number): Promise<Capitulo[]>;
    // getWithCapituloDetails(id: number): Promise<Capitulo & { objetivos: Objetivo[]; dicas: Dica[]; consultaSolucao: Consulta; }>; // TODO: definir melhor o shape de retorno, talvez incluir o desafioId para garantir unicidade
}
