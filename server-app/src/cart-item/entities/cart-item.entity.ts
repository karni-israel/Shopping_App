import { Product } from "src/product/entities/product.entity";
import { Column, Entity, ManyToOne,OneToOne,PrimaryGeneratedColumn } from "typeorm";
import { Cart } from "src/cart/entities/cart.entity";

@Entity('cart_items')
export class CartItem {

    @PrimaryGeneratedColumn()
    cart_item_id: number; 

  

    @Column()
    quantity: number;


    @ManyToOne(() => Cart, (cart) => cart.cart_items)
    cart: Cart;

    @ManyToOne(() => Product, (product) => product.cart_items)
    product: Product;
}
