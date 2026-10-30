import { SetMetadata } from '@nestjs/common';

export const ACESSO_CLIENTE_KEY = 'acesso_cliente';

/**
 * Marca a rota como acessível por token de cliente.
 * Por padrão o guard global nega clientes; este decorator é a allowlist explícita.
 * A lógica de posse (verificar clienteId) deve ser feita no handler.
 */
export const AcessoCliente = () => SetMetadata(ACESSO_CLIENTE_KEY, true);
