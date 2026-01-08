import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order_item } from './entities/order-item.entity';
import { OrderItemService } from './order-item.service';
import { OrderItemController } from './order-item.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order_item])],
  controllers: [OrderItemController],
  providers: [OrderItemService],
})
export class OrderItemModule {}
