export class Folder {
  constructor(
    public id: number,
    public nome: string,
    public dataCriacao: Date = new Date(),
    public isPublic: boolean,
    public senhaHash?: string
  ) {}
}

// [DOCS] A pasta tem uma senha, porque se ela nao for pública, o usuário que criar, passará uma senha pequena pra ela (PIN)