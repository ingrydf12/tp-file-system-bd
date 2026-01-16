export class File {
  constructor(
    public id: number,
    public nome: string,
    public tamanho: number,
    public tipo: string,
    public pasta_id: number
  ) {}
}
