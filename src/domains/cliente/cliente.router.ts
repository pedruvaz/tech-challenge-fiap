import { Module } from '@nestjs/common';
import { ClienteController } from './cliente.controller';
import { ClienteRepository } from './cliente.repository';
import { ClienteService } from './cliente.service';

@Module({
  controllers: [ClienteController],
  providers: [ClienteService, ClienteRepository],
  exports: [ClienteService, ClienteRepository],
})
export class ClienteModule {}
