export enum NivelPermissao {
  LEITURA = "leitura",
  ESCRITA = "escrita",
  ADMIN = "admin",
}

export class Permissao {
  constructor(
    public id: number,
    public usuario_id: number,
    public pasta_id: number,
    public tipo: NivelPermissao
  ) {}
}

// [Docs] As permissoes são pra acessar pastas