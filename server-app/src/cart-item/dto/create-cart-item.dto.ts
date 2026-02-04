import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartItemDto {
  @ApiProperty({ example: 1, description: 'כמות' })
  @IsNumber()
  @Min(1)
  quantity: number;
}