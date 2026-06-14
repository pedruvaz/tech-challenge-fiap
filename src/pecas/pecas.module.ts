import { Module } from '@nestjs/common';
import { PecasService } from './pecas.service';
import { PecasController } from './pecas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Peca } from './entities/peca.entity';

@Module({
  controllers: [PecasController],
  providers: [PecasService],
  imports: [TypeOrmModule.forFeature([Peca])]
})
export class PecasModule { }
