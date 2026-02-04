import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto'; // אפשר להשאיר לייבוא
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  // 👇 כאן השינוי: שיניתי ל-productData: any
  // זה מאפשר לקבל את האובייקט שבנינו בקונטרולר עם ה-imageUrl והמספרים המומרים
  create(productData: any) {
    const product = this.productRepository.create(productData);
    return this.productRepository.save(product);
  }

  findAll() {
    return this.productRepository.find();
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id); // מוודא שקיים
    Object.assign(product, updateProductDto); // מעדכן שדות
    return this.productRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    return this.productRepository.remove(product);
  }

  // --- הפונקציה למחיקת הכל ---
  async clearAll() {
    const queryRunner = this.productRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // מחיקה מלאה של הטבלה
      await queryRunner.query('DELETE FROM products');
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
    return { message: 'All products deleted' };
  }
}