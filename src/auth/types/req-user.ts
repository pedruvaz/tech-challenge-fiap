import type { Roles } from '@prisma/client';

export type UsuarioCliente = {
  tipo: 'CLIENTE';
  clienteId: string;
  nome: string;
  email?: string;
};

export type UsuarioFuncionario = {
  tipo: 'FUNCIONARIO';
  usuarioId: number;
  email: string;
  roles: Roles;
};

export type ReqUser = UsuarioCliente | UsuarioFuncionario;
