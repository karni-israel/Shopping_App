import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])], // <--- חשוב מאוד! מחבר את ה-Entity
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}