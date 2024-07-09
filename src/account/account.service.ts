import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Account, AccountDocument } from './schemas/account.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import { SignUpResponseDto } from './dto/sign-up-response.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    private jwtService: JwtService,
  ) {}

  async signUp(request: SignUpRequestDto): Promise<SignUpResponseDto> {
    try {
      const hashedPassword = await bcrypt.hash(request.password, 10);
      const newAccount = new this.accountModel({
        username: request.username,
        password: hashedPassword,
      });

      const result = await newAccount.save();
      return {
        userId: result._id,
        username: request.username,
      };
    } catch (error) {
      throw new Error(`An error occurred while signing up: ${error}`);
    }
  }

  async signIn(username: string, password: string): Promise<any> {
    const account = await this.accountModel.findOne({ username });
    if (account && (await bcrypt.compare(password, account.password))) {
      return this.generateToken(account);
    }
    throw new Error('Invalid credentials');
  }

  private generateToken(account: Account) {
    const payload = { username: account.username, sub: account._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
