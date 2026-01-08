import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15', description: 'שם המוצר' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'הטלפון החדש של אפל', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 3999.90 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'https://example.com/iphone.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 10, description: 'כמות במלאי' })
  @IsNumber()
  @Min(0)
  stock: number;
}