import { Controller, Get } from '@nestjs/common';

@Controller('account')
export class AccountController {
  @Get('signin')
  signIn(): string {
    return 'This is SignIn call';
  }

  @Get('signup')
  signUp(): string {
    return 'This is SignUp call';
  }
}
