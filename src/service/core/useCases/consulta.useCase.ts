import { Consulta } from "../domain/consulta.entity";
import { IConsultaPort } from "../ports/consulta.port";

export class ConsultaUseCase {
  constructor(private consultaPort: IConsultaPort) {}

  // GET
  async getAll(): Promise<Consulta[]> {
    return await this.consultaPort.getAll();
  }

  async getById(id: number): Promise<Consulta | null> {
    return await this.consultaPort.getById(id);
  }
}
