import { IsNotEmpty, IsString } from 'class-validator';

export class SignInResponseDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;
}
