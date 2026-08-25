export abstract class UnitOfWork {
  abstract executar<T>(trabalho: () => Promise<T>): Promise<T>;
}
