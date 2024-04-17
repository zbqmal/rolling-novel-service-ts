import { Body, Controller, Get, Post } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountDto } from './dto/account.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('signup')
  async signUp(
    @Body('username') username: string,
    @Body('password') password: string,
  ): Promise<AccountDto> {
    return await this.accountService.createAccount(username, password);
  }

  @Get('signin')
  signIn(): string {
    return 'This is SignIn call';
  }
}
