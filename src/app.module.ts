import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountController } from './account/account.controller';

@Module({
  imports: [],
  controllers: [AppController, AccountController],
  providers: [AppService],
})
export class AppModule {}
