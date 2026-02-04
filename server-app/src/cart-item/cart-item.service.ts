import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItem } from './entities/cart-item.entity';

@Injectable()
export class CartItemService {
  constructor(
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
  ) {}

  // פונקציה זו לא בשימוש ישיר כרגע (ההוספה נעשית דרך ה-CartService), אבל נשאיר אותה
  create(createCartItemDto: CreateCartItemDto) {
    return 'This action adds a new cartItem';
  }

  findAll() {
    return this.cartItemRepository.find();
  }

  async findOne(id: number) {
    const item = await this.cartItemRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Cart item #${id} not found`);
    return item;
  }

  // === זה החלק הקריטי שתוקן ===
  async update(id: number, updateCartItemDto: UpdateCartItemDto) {
    // 1. קודם מוצאים את הפריט
    const item = await this.cartItemRepository.findOne({ where: { id } });
    
    if (!item) {
      throw new NotFoundException(`Cart item #${id} not found`);
    }

    // 2. הגנה: אם הכמות שנשלחה היא פחות מ-1, נכפה 1 (מחיקה מתבצעת בפונקציה אחרת)
    if (updateCartItemDto.quantity !== undefined && updateCartItemDto.quantity < 1) {
       updateCartItemDto.quantity = 1;
    }

    // 3. עדכון הערכים ושמירה במסד הנתונים
    Object.assign(item, updateCartItemDto);
    return this.cartItemRepository.save(item);
  }

  async remove(id: number) {
    const result = await this.cartItemRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cart item #${id} not found`);
    }
    return { message: 'Item deleted successfully' };
  }
}