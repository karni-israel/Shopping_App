import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ example: 1, description: 'ID של המוצר' })
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 1, description: 'כמות' })
  @IsNumber()
  @Min(1)
  quantity: number;
}