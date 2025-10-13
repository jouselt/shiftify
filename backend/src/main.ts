// In backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // <-- Import this

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add this line to prefix all routes with '/api'
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  // Enable CORS for the Angular dev server
  app.enableCors({
    origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
  });

  await app.listen(3000);
}
bootstrap();