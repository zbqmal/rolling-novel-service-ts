import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Account, AccountDocument } from './schemas/account.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import { SignUpResponseDto } from './dto/sign-up-response.dto';
import { SignInRequestDto } from './dto/sign-in-request.dto';
import { SignInResponseDto } from './dto/sign-in-response.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    private jwtService: JwtService,
  ) {}

  /**
   * Signs up an account with a username and its hashed password if not exist
   * @param request Combination of username and password
   * @returns Id and username of the new account
   */
  async signUp(request: SignUpRequestDto): Promise<SignUpResponseDto> {
    try {
      // Validate input data
      if (!request.username || !request.password) {
        throw new BadRequestException('Username and password are required');
      }

      // Check if the username already exists
      const existingAccount = await this.accountModel.findOne({
        username: request.username,
      });
      if (existingAccount) {
        throw new ConflictException(
          `Username ${request.username} already exists`,
        );
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(request.password, 10);

      // Create a new account
      const newAccount = new this.accountModel({
        username: request.username,
        password: hashedPassword,
      });

      // Save the account to the database
      const result = await newAccount.save();

      // Check if the id of the user exists
      if (!result._id) {
        throw new InternalServerErrorException(
          'User id is not generated properly',
        );
      }

      return {
        userId: result._id,
        username: request.username,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          `An error occurred while signing up: ${error.message}`,
        );
      }
    }
  }

  /**
   * Verifies if a requested account exists in DB and returns its access token
   * @param request Combination of username and password
   * @returns JWT access token linked to the account
   */
  async signIn(request: SignInRequestDto): Promise<SignInResponseDto> {
    try {
      // Validate input data
      if (!request.username || !request.password) {
        throw new BadRequestException('Username and password are required');
      }

      // Find the account
      const account = await this.accountModel.findOne({
        username: request.username,
      });
      if (!account) {
        throw new NotFoundException(`Account ${request.username} not found`);
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(
        request.password,
        account.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate token
      return this.generateToken(account);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          `An error occurred while signing in: ${error.message}`,
        );
      }
    }
  }

  /**
   * Generates JWT access token for an account
   * @param account An account to be used for generating a JWT access token
   * @returns JWT access token
   */
  private generateToken(account: Account) {
    try {
      const payload = { username: account.username, sub: account._id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `An error occurred while generating the token: ${error.message}`,
      );
    }
  }
}
