import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from '../order-item/entities/order-item.entity';
import { Product } from '../product/entities/product.entity';
import { CartModule } from '../cart/cart.module'; // חשוב: ייבוא המודול של העגלה

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product]),
    CartModule, 
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}