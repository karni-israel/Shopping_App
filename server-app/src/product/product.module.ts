import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; // הייבוא החדש

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CloudinaryModule // הוספנו את זה כדי שהקונטרולר יכיר את שירות ההעלאה
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}