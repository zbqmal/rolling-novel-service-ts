import { IsNotEmpty, IsString } from 'class-validator';

export class SignUpRequestDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
