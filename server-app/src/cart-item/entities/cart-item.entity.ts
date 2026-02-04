import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Cart } from '../../cart/entities/cart.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  quantity: number;

  // קישור לעגלה (הרבה פריטים לעגלה אחת)
  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  cart: Cart;

  // קישור למוצר (הרבה פריטים יכולים להצביע על אותו מוצר בעגלות שונות)
   @ManyToOne(() => Product, { eager: true, onDelete: 'CASCADE' }) // eager: true מביא את פרטי המוצר אוטומטית כששולפים את הפריט
  product: Product;
}