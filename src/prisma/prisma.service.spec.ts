import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  const urlOriginal = process.env.DATABASE_URL;

  beforeAll(() => {
    process.env.DATABASE_URL =
      'postgresql://postgres:postgres@localhost:5432/oficina_test';
  });

  afterAll(() => {
    process.env.DATABASE_URL = urlOriginal;
  });

  it('constrói o client com o adapter pg apontando para DATABASE_URL', () => {
    expect(() => new PrismaService()).not.toThrow();
  });

  it('conecta no boot do módulo', async () => {
    const service = new PrismaService();
    const connect = jest
      .spyOn(service, '$connect')
      .mockResolvedValue(undefined);

    await service.onModuleInit();

    expect(connect).toHaveBeenCalledTimes(1);
  });

  it('desconecta no shutdown do módulo', async () => {
    const service = new PrismaService();
    const disconnect = jest
      .spyOn(service, '$disconnect')
      .mockResolvedValue(undefined);

    await service.onModuleDestroy();

    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('propaga falha de conexão em vez de engolir o erro', async () => {
    const service = new PrismaService();
    jest
      .spyOn(service, '$connect')
      .mockRejectedValue(new Error('banco indisponível'));

    await expect(service.onModuleInit()).rejects.toThrow('banco indisponível');
  });
});
