import { Entity } from "typeorm";
import { Order } from "src/order/entities/order.entity";
import { ManyToOne, Column, PrimaryGeneratedColumn} from "typeorm";
import { Product } from "src/product/entities/product.entity";

@Entity('order_items')
export class Order_item {

    @PrimaryGeneratedColumn()
    order_item_id: number;

    @Column()
    quantity: number;

    @Column()
    price: number;

    @ManyToOne(() => Order, (order) => order.order_items)
    order: Order;

    @ManyToOne(() => Product, (product) => product.order_items)
    product: Product;
}
