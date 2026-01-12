export class Log {
  constructor(
    public id: number,
    public action: string,
    public data: Date = new Date()
  ) {};
};

// [Docs] Log de ações feitas no sistema de arquivos, básico