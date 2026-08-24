import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class AtualizarStatusRequest {
  @ApiProperty({ enum: Status })
  @IsEnum(Status)
  status: Status;
}
