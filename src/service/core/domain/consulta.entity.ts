export class Consulta {
  constructor(
    public id: number,
    public idCapitulo: number,
    public query: string,
    public colunas: string[],
    public resultado: Record<string, unknown>[]
  ) {}
}
