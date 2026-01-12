export class Folder {
  constructor(
    public id: number,
    public nome: string,
    public data_criacao: Date,
    public isPublic: boolean,
    public usuario_id: number,
    public pin?: string
  ) {}
}

// [DOCS] A pasta tem uma senha, porque se ela nao for pública, o usuário que criar, passará uma senha pequena pra ela (PIN)