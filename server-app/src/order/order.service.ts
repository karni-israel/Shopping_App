import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from '../order-item/entities/order-item.entity';
import { Product } from '../product/entities/product.entity';
import { CartService } from '../cart/cart.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private cartService: CartService,
  ) {}

  async create(userId: number) {
    // 1. קבלת העגלה
    const cart = await this.cartService.getCart(userId);

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // בדיקת מלאי לפני ביצוע ההזמנה
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(`Not enough stock for product ${item.product.name}`);
      }
    }

    // 2. חישוב סכום כולל
    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + (Number(item.product.price) * item.quantity);
    }, 0);

    // 3. יצירת ההזמנה
    const order = this.orderRepository.create({
      user: { id: userId } as User,
      totalAmount,
    });
    
    const savedOrder = await this.orderRepository.save(order);

    // 4. העברת פריטים מהעגלה להזמנה
    const orderItems = cart.items.map(cartItem => {
      return this.orderItemRepository.create({
        order: savedOrder,
        product: cartItem.product,
        quantity: cartItem.quantity,
        price: cartItem.product.price, // שומרים את המחיר שהיה בעת ההזמנה
      });
    });

    await this.orderItemRepository.save(orderItems);

    // עדכון המלאי (הפחתת הכמות שנרכשה)
    for (const item of cart.items) {
      item.product.stock -= item.quantity;
      await this.productRepository.save(item.product);
    }

    // 5. ריקון העגלה
    await this.cartService.clearCart(userId);

    return this.findOne(savedOrder.id);
  }

  async findAll(userId: number) {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      order: { orderDate: 'DESC' }
    });
  }

  async findOne(id: number) {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'user'],
    });
  }
}