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
import { User } from './users/entities/user.entity';

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
        host: configService.get('DATABASE_HOST') || 'localhost',
        port: configService.get('DATABASE_PORT') || 5432,
        username: configService.get('DATABASE_USER') || 'postgres',
        password: configService.get('DATABASE_PASSWORD') || 'postgres',
        database: configService.get('DATABASE_NAME') || 'shopping_app',
        // מונע מחיקת נתונים בסביבת ייצור (Production)
        synchronize: configService.get('NODE_ENV') !== 'production',
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