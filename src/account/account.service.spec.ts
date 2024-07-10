import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Account } from './schemas/account.schema';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import * as bcrypt from 'bcryptjs';
import { SignInRequestDto } from './dto/sign-in-request.dto';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockJwtService = {
  sign: jest.fn(),
};

const expectedUsername = 'test_username';
const expectedPassword = 'test_password';
const expectedHashedPassword = 'test_hashed_password';
const expectedUserId = '123';

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
              _id: expectedUserId,
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
          username: expectedUsername,
          password: expectedPassword,
        };
        const newAccount = {
          _id: expectedUserId,
          username: expectedUsername,
          password: expectedHashedPassword,
        };

        (bcrypt.hash as jest.Mock).mockResolvedValue(expectedHashedPassword);

        const result = await accountService.signUp(signUpRequestDto);

        expect(bcrypt.hash).toHaveBeenCalledWith(expectedPassword, 10);
        expect(mockAccountModel).toHaveBeenCalledWith({
          username: expectedUsername,
          password: expectedHashedPassword,
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
          username: expectedUsername,
          password: expectedPassword,
        };

        (bcrypt.hash as jest.Mock).mockResolvedValue(expectedHashedPassword);

        await expect(accountService.signUp(signUpRequestDto)).rejects.toThrow(
          `An error occurred while signing up: ${error}`,
        );
      });
    });
  });

  describe('signIn', () => {
    describe('success', () => {
      beforeEach(async () => {
        mockAccountModel = {
          findOne: jest.fn().mockImplementation(({ username }) => ({
            _id: expectedUserId,
            username: username,
            password: expectedHashedPassword,
          })),
        };
        const module = await createTestModule(mockAccountModel);
        accountService = (module as TestingModule).get<AccountService>(
          AccountService,
        );
        jwtService = (module as TestingModule).get<JwtService>(JwtService);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      });

      it('should return an access token properly', async () => {
        const signInRequestDto: SignInRequestDto = {
          username: expectedUsername,
          password: expectedPassword,
        };

        const result = await accountService.signIn(signInRequestDto);

        expect(result.access_token).not.toBeNull();
        expect(jwtService.sign).toHaveBeenCalledWith({
          username: expectedUsername,
          sub: expectedUserId,
        });
      });
    });

    describe('failure', () => {
      describe('when account does not exist in db', () => {
        beforeEach(async () => {
          mockAccountModel = {
            findOne: jest.fn().mockReturnValue(null),
          };
          const module = await createTestModule(mockAccountModel);
          accountService = (module as TestingModule).get<AccountService>(
            AccountService,
          );
          jwtService = (module as TestingModule).get<JwtService>(JwtService);
          (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        });

        it('should throw an error', async () => {
          const signInRequestDto: SignInRequestDto = {
            username: expectedUsername,
            password: expectedPassword,
          };

          await expect(accountService.signIn(signInRequestDto)).rejects.toThrow(
            'Invalid credentials',
          );
        });
      });

      describe('when password does not match', () => {
        beforeEach(async () => {
          mockAccountModel = {
            findOne: jest.fn().mockImplementation(({ username }) => ({
              _id: expectedUserId,
              username: username,
              password: expectedHashedPassword,
            })),
          };
          const module = await createTestModule(mockAccountModel);
          accountService = (module as TestingModule).get<AccountService>(
            AccountService,
          );
          jwtService = (module as TestingModule).get<JwtService>(JwtService);
          (bcrypt.compare as jest.Mock).mockResolvedValue(false);
        });

        it('should throw an error', async () => {
          const signInRequestDto: SignInRequestDto = {
            username: expectedUsername,
            password: expectedPassword,
          };

          await expect(accountService.signIn(signInRequestDto)).rejects.toThrow(
            'Invalid credentials',
          );
        });
      });
    });
  });
});
