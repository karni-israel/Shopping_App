import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import cookieParser from 'cookie-parser';
 // <--- 1. ייבוא הספרייה

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // הגדרת CORS - חובה כדי לעבוד עם React ו-Cookies
  app.enableCors({
    origin: true, // מאפשר לכל מקור לגשת (פותר בעיות CORS בפיתוח)
    credentials: true, // חובה! מאפשר שליחת Cookies
  });

  app.use(cookieParser()); // <--- 2. הפעלת ה-Middleware

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('Shopping App')
    .setDescription('API documentation for my shopping app')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
