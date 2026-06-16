import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PecasUtilizadasService } from './pecas-utilizadas.service';
import { CreatePecasUtilizadaDto } from './dto/create-pecas-utilizada.dto';
import { UpdatePecasUtilizadaDto } from './dto/update-pecas-utilizada.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PecasUtilizada } from './entities/pecas-utilizada.entity';

@ApiTags('Peças Utilizadas')
@Controller('pecas-utilizadas')
export class PecasUtilizadasController {
  constructor(
    private readonly pecasUtilizadasService: PecasUtilizadasService,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: PecasUtilizada })
  create(@Body() createPecasUtilizadaDto: CreatePecasUtilizadaDto) {
    return this.pecasUtilizadasService.create(createPecasUtilizadaDto);
  }

  @Get()
  @ApiOkResponse({ type: [PecasUtilizada] })
  findAll() {
    return this.pecasUtilizadasService.findAll();
  }

  @Get(':osId/:pecaId')
  @ApiOkResponse({ type: [PecasUtilizada] })
  findOne(
    @Param('osId') osId: string,
    @Param('pecaId', ParseIntPipe) pecaId: number,
  ) {
    return this.pecasUtilizadasService.findOne(osId, pecaId);
  }

  @Patch(':osId/:pecaId')
  @ApiOkResponse({ type: [PecasUtilizada] })
  update(
    @Param('osId') osId: string,
    @Param('pecaId', ParseIntPipe) pecaId: number,
    @Body() updatePecasUtilizadaDto: UpdatePecasUtilizadaDto,
  ) {
    return this.pecasUtilizadasService.update(
      osId,
      Number(pecaId),
      updatePecasUtilizadaDto,
    );
  }

  @Delete(':osId/:pecaId')
  @ApiOkResponse({ type: [PecasUtilizada] })
  remove(
    @Param('osId') osId: string,
    @Param('pecaId', ParseIntPipe) pecaId: number,
  ) {
    return this.pecasUtilizadasService.remove(osId, Number(pecaId));
  }
}
