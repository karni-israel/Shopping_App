import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from '../cart-item/entities/cart-item.entity';
import { Product } from '../product/entities/product.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getCart(userId: number) {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'], // מביא גם את הפריטים וגם את פרטי המוצר
    });

    if (!cart) {
      // אם אין עגלה למשתמש, ניצור אחת חדשה
      cart = this.cartRepository.create({ user: { id: userId } });
      await this.cartRepository.save(cart);
      cart.items = [];
    }

    return this.calculateCartTotal(cart);
  }

  async addToCart(userId: number, addToCartDto: AddToCartDto) {
    const { productId, quantity } = addToCartDto;
    const cart = await this.getCart(userId);
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // בדיקה האם המוצר כבר קיים בעגלה
    let cartItem = await this.cartItemRepository.findOne({
      where: { cart: { id: cart.id }, product: { id: productId } },
    });

    if (cartItem) {
      // אם קיים - נעדכן כמות
      cartItem.quantity += quantity;
    } else {
      // אם לא קיים - ניצור חדש
      cartItem = this.cartItemRepository.create({
        cart,
        product,
        quantity,
      });
    }

    await this.cartItemRepository.save(cartItem);
    return this.getCart(userId); // מחזיר את העגלה המעודכנת
  }

  async removeFromCart(userId: number, cartItemId: number) {
    const cart = await this.getCart(userId);
    
    // מחיקת הפריט (רק אם הוא שייך לעגלה של המשתמש)
    await this.cartItemRepository.delete({ id: cartItemId, cart: { id: cart.id } });
    
    return this.getCart(userId);
  }

  async clearCart(userId: number) {
    const cart = await this.getCart(userId);
    await this.cartItemRepository.delete({ cart: { id: cart.id } });
    return this.getCart(userId);
  }

  private calculateCartTotal(cart: Cart) {
    const total = cart.items.reduce((sum, item) => {
      return sum + (Number(item.product.price) * item.quantity);
    }, 0);
    return { ...cart, total }; // מחזיר את העגלה עם שדה total מחושב
  }
}