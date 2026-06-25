import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ServicoService } from './servico.service';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Servico } from './entities/servico.entity';

@ApiTags('Servico')
@ApiBearerAuth('access-token')
@Controller('servico')
export class ServicoController {
  constructor(private readonly servicoService: ServicoService) {}

  @Post()
  @ApiCreatedResponse({ type: Servico })
  create(@Body() createServicoDto: CreateServicoDto) {
    return this.servicoService.create(createServicoDto);
  }

  @Get()
  @ApiOkResponse({ type: [Servico] })
  findAll() {
    return this.servicoService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: [Servico] })
  findOne(@Param('id') id: string) {
    return this.servicoService.findOne(+id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: [Servico] })
  update(@Param('id') id: string, @Body() updateServicoDto: UpdateServicoDto) {
    return this.servicoService.update(+id, updateServicoDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: [Servico] })
  remove(@Param('id') id: string) {
    return this.servicoService.remove(+id);
  }
}
