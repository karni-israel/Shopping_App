import { Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CartItem } from '../../cart-item/entities/cart-item.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  // קישור למשתמש (עגלה אחת למשתמש אחד)
  @OneToOne(() => User, (user) => user.carts)
  @JoinColumn()
  user: User;

  // קישור לפריטים (עגלה אחת מכילה הרבה פריטים)
  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  items: CartItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}