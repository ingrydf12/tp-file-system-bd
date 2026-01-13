export class Log {
  constructor(
    public id: number,
    public action: string,
    public data_hora: Date = new Date(),
    public usuario_id: number
  ) {};
};

// [Docs] Log de ações feitas no sistema de arquivos, básico