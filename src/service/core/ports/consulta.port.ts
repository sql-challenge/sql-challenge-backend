import { Consulta } from "../domain/consulta.entity";

export interface IConsultaPort {
  getAll(): Promise<Consulta[]>;
  getById(id: number): Promise<Consulta>;
  getByCapituloId(idCapitulo: number): Promise<Consulta[]>;
  getByObjetivoId(idObjetivo: number): Promise<Consulta | null>;
}
