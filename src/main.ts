import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // MongoDB Connection
  await mongoose.connect('mongodb://localhost:27017/rolling-novel');

  await app.listen(3000);
}
bootstrap();
