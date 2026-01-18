import { Cart } from 'src/cart/entities/cart.entity';
import { Order } from 'src/order/entities/order.entity';
import { Entity, OneToOne, CreateDateColumn, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer'; // <--- 1. הוספת הייבוא

@Entity('users')
export class User {
  @PrimaryGeneratedColumn() // יוצר עמודת ID אוטומטית
  id: number;

  @Column({ unique: true, nullable: true})
  username: string;

  
  @Column({ unique: true })
  email: string;

  
   @Column({ nullable: true })
  @Exclude() // <--- 2. ׳”׳•׳¡׳₪׳× ׳”׳“׳§׳•׳¨׳˜׳•׳¨ ׳©׳׳¡׳×׳™׳¨ ׳׳× ׳”׳¡׳™׳¡׳׳”
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ default: 'local' })
  provider: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToOne(() => Cart, (cart) => cart.user)
  carts: Cart;
}
