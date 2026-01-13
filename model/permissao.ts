export enum NivelPermissao {
  LEITURA = "Leitura",
  ESCRITA = "Escrita",
  ADMIN = "Admin",
}

export class Permissao {
  constructor(
    public id: number,
    public usuario_id: number,
    public pasta_id: number,
    public tipo: NivelPermissao
  ) {}
}

// [Docs] As permissoes são pra acessar arquivos