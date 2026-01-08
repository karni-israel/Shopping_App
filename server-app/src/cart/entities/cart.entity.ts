import e from "express";
import { CartItem } from "src/cart-item/entities/cart-item.entity";
import { User } from "src/users/entities/user.entity";
import { ManyToOne,OneToOne,Column,Entity,PrimaryGeneratedColumn, OneToMany } from "typeorm";

@Entity('carts')
export class Cart {
    @PrimaryGeneratedColumn()
    cart_id: number;

    @Column()
    created_at: Date;

    
    @OneToOne(() => User, (user) => user.carts)
    user: User;

    @OneToMany(() => CartItem, (cart_item)  => cart_item.cart)
    cart_items: CartItem[];
}
