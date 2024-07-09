import { Body, Controller, Post } from '@nestjs/common';
import { AccountService } from './account.service';
import { SignUpRequestDto } from './dto/sign-up-request.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('signup')
  async signUp(@Body() request: SignUpRequestDto) {
    return this.accountService.signUp(request);
  }

  @Post('signin')
  async signIn(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    return this.accountService.signIn(username, password);
  }
}
