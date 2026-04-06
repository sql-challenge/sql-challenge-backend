export class Consulta {
  constructor(
    public id: number,
    public idCapitulo: number,
    public idObjetivo: number | null,
    public query: string,
    public colunas: string[],
    public resultado: Record<string, unknown>[]
  ) {}
}
