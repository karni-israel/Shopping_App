import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService} from '@nestjs/config'; // חובה עבור ה-.env
import { AuthModule } from './auth/auth.module'; // המודול שבנינו
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { CartItemModule } from './cart-item/cart-item.module';
import { OrderItemModule } from './order-item/order-item.module';
import { ProductModule } from './product/product.module';
import { TypeOrmModule } from '@nestjs/typeorm';
// ... שאר הייבואים שלך (Cart, Order וכו')

@Module({
  imports: [
    // הגדרת ConfigModule כגלובלי כדי שכל האפליקציה תכיר את ה-JWT_SECRET
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        synchronize: true,
        logging: false,
        autoLoadEntities: true
      }),
    }), // וודא שיש לך קובץ ormconfig.json או הגדרות מתאימות כאן
    AuthModule, // הוספת מודול האימות
    UsersModule,
    CartModule,
    OrderModule,
    CartItemModule,
    OrderItemModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}