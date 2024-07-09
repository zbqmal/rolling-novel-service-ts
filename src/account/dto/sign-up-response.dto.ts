import { IsNotEmpty, IsString } from 'class-validator';

export class SignUpResponseDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  username: string;
}
