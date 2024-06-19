import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.enableCors({
    origin: 'http://localhost:3000', // Frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Set to true if you need to send cookies with the request
  });

  // MongoDB Connection
  await mongoose.connect('mongodb://localhost:27017/rolling-novel');

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
}
bootstrap();
