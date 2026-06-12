import { PrismaClient, Roles, Tipo } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');

  // ── Usuários ────────────────────────────────────────────────────────────
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@oficina.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@oficina.com',
      senha: 'senha123', // substituir por hash quando auth estiver pronto
      roles: Roles.admin,
    },
  });

  const mecanico1 = await prisma.usuario.upsert({
    where: { email: 'joao.mecanico@oficina.com' },
    update: {},
    create: {
      nome: 'João Silva',
      email: 'joao.mecanico@oficina.com',
      senha: 'senha123',
      roles: Roles.mecanico,
    },
  });

  const mecanico2 = await prisma.usuario.upsert({
    where: { email: 'carlos.mecanico@oficina.com' },
    update: {},
    create: {
      nome: 'Carlos Souza',
      email: 'carlos.mecanico@oficina.com',
      senha: 'senha123',
      roles: Roles.mecanico,
    },
  });

  console.log(`  ✓ Usuários: ${admin.nome}, ${mecanico1.nome}, ${mecanico2.nome}`);

  // ── Clientes ────────────────────────────────────────────────────────────
  const cliente1 = await prisma.cliente.upsert({
    where: { numDocumento: '123.456.789-09' },
    update: {},
    create: {
      numDocumento: '123.456.789-09',
      nome: 'Maria Oliveira',
      telefone: '(11) 99999-1111',
      tipo: Tipo.pessoa_fisica,
    },
  });

  const cliente2 = await prisma.cliente.upsert({
    where: { numDocumento: '987.654.321-00' },
    update: {},
    create: {
      numDocumento: '987.654.321-00',
      nome: 'Pedro Costa',
      telefone: '(11) 98888-2222',
      tipo: Tipo.pessoa_fisica,
    },
  });

  const cliente3 = await prisma.cliente.upsert({
    where: { numDocumento: '12.345.678/0001-90' },
    update: {},
    create: {
      numDocumento: '12.345.678/0001-90',
      nome: 'Transportes Rápido Ltda',
      telefone: '(11) 3333-4444',
      tipo: Tipo.pessoa_juridica,
    },
  });

  console.log(`  ✓ Clientes: ${cliente1.nome}, ${cliente2.nome}, ${cliente3.nome}`);

  // ── Veículos ────────────────────────────────────────────────────────────
  const veiculo1 = await prisma.veiculo.upsert({
    where: { placa: 'ABC-1234' },
    update: {},
    create: {
      placa: 'ABC-1234',
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: '2020',
      cor: 'Prata',
    },
  });

  const veiculo2 = await prisma.veiculo.upsert({
    where: { placa: 'DEF-5678' },
    update: {},
    create: {
      placa: 'DEF-5678',
      marca: 'Honda',
      modelo: 'Civic',
      ano: '2019',
      cor: 'Preto',
    },
  });

  const veiculo3 = await prisma.veiculo.upsert({
    where: { placa: 'GHI-9012' },
    update: {},
    create: {
      placa: 'GHI-9012',
      marca: 'Ford',
      modelo: 'Transit',
      ano: '2021',
      cor: 'Branco',
    },
  });

  console.log(`  ✓ Veículos: ${veiculo1.placa}, ${veiculo2.placa}, ${veiculo3.placa}`);

  // ── Vínculo Veículo ↔ Cliente ───────────────────────────────────────────
  await prisma.veiculoCliente.upsert({
    where: { veiculoId_clienteId: { veiculoId: veiculo1.veiculoId, clienteId: cliente1.clienteId } },
    update: {},
    create: { veiculoId: veiculo1.veiculoId, clienteId: cliente1.clienteId },
  });

  await prisma.veiculoCliente.upsert({
    where: { veiculoId_clienteId: { veiculoId: veiculo2.veiculoId, clienteId: cliente2.clienteId } },
    update: {},
    create: { veiculoId: veiculo2.veiculoId, clienteId: cliente2.clienteId },
  });

  await prisma.veiculoCliente.upsert({
    where: { veiculoId_clienteId: { veiculoId: veiculo3.veiculoId, clienteId: cliente3.clienteId } },
    update: {},
    create: { veiculoId: veiculo3.veiculoId, clienteId: cliente3.clienteId },
  });

  console.log('  ✓ Vínculos veículo ↔ cliente criados');

  // ── Peças ───────────────────────────────────────────────────────────────
  const peca1 = await prisma.peca.upsert({
    where: { pecaId: 1 },
    update: {},
    create: { nome: 'Filtro de Óleo', qtdEstoque: 50, valorUn: 35.90 },
  });

  const peca2 = await prisma.peca.upsert({
    where: { pecaId: 2 },
    update: {},
    create: { nome: 'Pastilha de Freio', qtdEstoque: 30, valorUn: 89.90 },
  });

  const peca3 = await prisma.peca.upsert({
    where: { pecaId: 3 },
    update: {},
    create: { nome: 'Correia Dentada', qtdEstoque: 20, valorUn: 149.90 },
  });

  console.log(`  ✓ Peças: ${peca1.nome}, ${peca2.nome}, ${peca3.nome}`);

  // ── Insumos ─────────────────────────────────────────────────────────────
  const insumo1 = await prisma.insumo.upsert({
    where: { insumoId: 1 },
    update: {},
    create: { nome: 'Óleo Motor 5W30', qtdEstoque: 100, valorUn: 28.50 },
  });

  const insumo2 = await prisma.insumo.upsert({
    where: { insumoId: 2 },
    update: {},
    create: { nome: 'Fluido de Freio DOT4', qtdEstoque: 40, valorUn: 22.00 },
  });

  console.log(`  ✓ Insumos: ${insumo1.nome}, ${insumo2.nome}`);

  // ── Serviços ────────────────────────────────────────────────────────────
  const servico1 = await prisma.servico.upsert({
    where: { servicoId: 1 },
    update: {},
    create: { descricao: 'Troca de Óleo', valor: 80.00 },
  });

  const servico2 = await prisma.servico.upsert({
    where: { servicoId: 2 },
    update: {},
    create: { descricao: 'Alinhamento e Balanceamento', valor: 120.00 },
  });

  const servico3 = await prisma.servico.upsert({
    where: { servicoId: 3 },
    update: {},
    create: { descricao: 'Revisão Completa', valor: 350.00 },
  });

  console.log(`  ✓ Serviços: ${servico1.descricao}, ${servico2.descricao}, ${servico3.descricao}`);

  console.log('\nSeed concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
