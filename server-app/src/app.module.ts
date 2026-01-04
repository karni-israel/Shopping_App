import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { CartItemModule } from './cart-item/cart-item.module';
import { OrderItemModule } from './order-item/order-item.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [UsersModule, CartModule, OrderModule, CartItemModule, OrderItemModule, ProductModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
