import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core'; // 👈 ייבוא חשוב
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; // 👈 ייבוא המגן
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { CartItemModule } from './cart-item/cart-item.module';
import { OrderItemModule } from './order-item/order-item.module';
import { ProductModule } from './product/product.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // 👇 הגדרת המגן: מקסימום 60 בקשות בדקה (60000 מילי-שניות) לכל משתמש
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),

    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST') || 'localhost',
        port: configService.get('DATABASE_PORT') || 5432,
        username: configService.get('DATABASE_USER') || 'postgres',
        password: configService.get('DATABASE_PASSWORD') || 'postgres',
        database: configService.get('DATABASE_NAME') || 'shopping_app',
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: false,
        autoLoadEntities: true
      }),
    }),
    AuthModule,
    UsersModule,
    CartModule,
    OrderModule,
    CartItemModule,
    OrderItemModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 👇 הפעלת המגן על כל האפליקציה
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}