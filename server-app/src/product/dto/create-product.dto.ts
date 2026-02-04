import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer'; // 👈 1. ייבוא חשוב מאוד!

export class CreateProductDto {

  @ApiProperty({ example: 1, description: 'מזהה קטגוריה', required: false })
  @IsOptional()
  @Type(() => Number) // 👈 2. הפקודה שממירה טקסט למספר
  @IsNumber()
  categoryId?: number;

  @ApiProperty({ example: 'iPhone 15', description: 'שם המוצר' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'הטלפון החדש של אפל', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 3999.90 })
  @Type(() => Number) // 👈 3. חובה להמיר את המחיר
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'https://example.com/iphone.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 10, description: 'כמות במלאי' })
  @Type(() => Number) // 👈 4. חובה להמיר את המלאי
  @IsNumber()
  @Min(0)
  stock: number;
}