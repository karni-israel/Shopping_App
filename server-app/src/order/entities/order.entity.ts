import { Order_item } from "src/order-item/entities/order-item.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany,PrimaryGeneratedColumn} from "typeorm";


@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    order_id: number;

    @Column()
    total_amount: number;
    
    @Column()
    order_date: Date;

    @Column()
    status: string;

    @ManyToOne(() => User, (user) => user.orders)
    user: User;

    @OneToMany(() => Order_item, order_item => order_item.order)
    order_items: Order_item[];
}
