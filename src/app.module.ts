import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountModule } from './account/account.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env.local' }),
    MongooseModule.forRoot('mongodb://localhost/nestjs-jwt-mongodb'),
    AccountModule,
  ],
})
export class AppModule {}
