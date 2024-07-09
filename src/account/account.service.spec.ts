import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Account } from './schemas/account.schema';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockJwtService = {
  sign: jest.fn(),
};

describe('AccountService', () => {
  let accountService: AccountService;
  let mockAccountModel: any;
  let jwtService: JwtService;

  const createTestModule = async (mockAccountModel: any) =>
    await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: getModelToken(Account.name),
          useValue: mockAccountModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    describe('success', () => {
      beforeEach(async () => {
        mockAccountModel = jest
          .fn()
          .mockImplementation((request: SignUpRequestDto) => ({
            username: request.username,
            password: request.password,
            save: jest.fn().mockReturnValue({
              _id: '123',
              username: request.username,
              password: request.password,
            }),
          }));
        const module = await createTestModule(mockAccountModel);
        accountService = (module as TestingModule).get<AccountService>(
          AccountService,
        );
        jwtService = (module as TestingModule).get<JwtService>(JwtService);
      });

      it('should hash the password and save the new account', async () => {
        const signUpRequestDto: SignUpRequestDto = {
          username: 'test_user',
          password: 'test_password',
        };
        const hashedPassword = 'hashed_password';
        const newAccount = {
          _id: '123',
          username: 'test_user',
          password: hashedPassword,
        };

        (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

        const result = await accountService.signUp(signUpRequestDto);

        expect(bcrypt.hash).toHaveBeenCalledWith(signUpRequestDto.password, 10);
        expect(mockAccountModel).toHaveBeenCalledWith({
          username: signUpRequestDto.username,
          password: hashedPassword,
        });
        expect(result).toEqual({
          userId: newAccount._id,
          username: newAccount.username,
        });
      });
    });

    describe('failure', () => {
      let error: any;
      beforeEach(async () => {
        error = new Error('Test error');
        mockAccountModel = jest
          .fn()
          .mockImplementation((request: SignUpRequestDto) => ({
            username: request.username,
            password: request.password,
            save: jest.fn().mockRejectedValue(error),
          }));
        const module = await createTestModule(mockAccountModel);
        accountService = (module as TestingModule).get<AccountService>(
          AccountService,
        );
        jwtService = (module as TestingModule).get<JwtService>(JwtService);
      });

      it('should throw an error if it failed to save the account', async () => {
        const signUpRequestDto: SignUpRequestDto = {
          username: 'test_user',
          password: 'test_password',
        };

        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

        await expect(accountService.signUp(signUpRequestDto)).rejects.toThrow(
          `An error occurred while signing up: ${error}`,
        );
      });
    });
  });
});
