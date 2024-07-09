import { Body, Controller, Post } from '@nestjs/common';
import { AccountService } from './account.service';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import { SignUpResponseDto } from './dto/sign-up-response.dto';
import { SignInRequestDto } from './dto/sign-in-request.dto';
import { SignInResponseDto } from './dto/sign-in-response.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('signup')
  async signUp(@Body() request: SignUpRequestDto): Promise<SignUpResponseDto> {
    return this.accountService.signUp(request);
  }

  @Post('signin')
  async signIn(@Body() request: SignInRequestDto): Promise<SignInResponseDto> {
    return this.accountService.signIn(request);
  }
}
