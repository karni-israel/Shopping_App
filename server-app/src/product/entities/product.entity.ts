import { Order_item } from "src/order-item/entities/order-item.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm";
import { CartItem } from "src/cart-item/entities/cart-item.entity";


@Entity('products')
export class Product {

    @PrimaryGeneratedColumn()
    product_id: number;


    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    price: number;

    @Column()
    stock: number;

    @OneToMany(() => CartItem, (cart_item) => cart_item.product)
    cart_items: CartItem[];

    @OneToMany(() => Order_item, (order_item) => order_item.product)
    order_items: Order_item[];
}