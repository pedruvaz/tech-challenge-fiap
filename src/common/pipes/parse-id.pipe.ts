import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  private readonly MAX_SAFE_ID = 2147483647;

  transform(value: string, metadata: ArgumentMetadata): number {
    if (!/^\d+$/.test(value)) {
      throw new BadRequestException(
        `O parâmetro "${metadata.data}" deve ser um número inteiro válido.`,
      );
    }
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed > this.MAX_SAFE_ID) {
      throw new BadRequestException(
        `O parâmetro "${metadata.data}" excede o valor máximo permitido (${this.MAX_SAFE_ID}).`,
      );
    }
    return parsed;
  }
}
