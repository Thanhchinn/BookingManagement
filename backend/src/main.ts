import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Kích hoạt CORS hỗ trợ gửi cookie/credentials và nhận request từ React
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // Sử dụng ValidationPipe toàn cục để lọc các tham số thừa tự động (Anti mass assignment)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Sử dụng interceptor toàn cục để tự động chuyển kiểu BigInt sang String và Decimal sang Number
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
