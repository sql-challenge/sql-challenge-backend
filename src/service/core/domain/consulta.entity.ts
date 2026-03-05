export class Consulta {
  constructor(
    public id: number,
    public idCapitulo: number,
    public colunas: string[],
    public resultado: Record<string, unknown>[]
  ) {}
}
