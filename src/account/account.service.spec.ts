import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Account, AccountDocument } from './schemas/account.schema';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import * as bcrypt from 'bcryptjs';
import { SignInRequestDto } from './dto/sign-in-request.dto';
import { Model } from 'mongoose';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

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

  const createMockAccountModel = (
    modelFuns: { save?: any; findOne?: any } = { save: null, findOne: null },
  ) => {
    let mockModel: any;
    mockModel = jest.fn().mockImplementation((request: SignUpRequestDto) => ({
      username: request.username,
      password: request.password,
      save:
        modelFuns.save ??
        jest.fn().mockReturnValue({
          _id: expectedUserId,
          username: request.username,
          password: request.password,
        }),
    }));
    mockModel.findOne = modelFuns.findOne ?? jest.fn().mockReturnValue(null);
    return mockModel;
  };

  const createModule = async () => {
    const module = await createTestModule(mockAccountModel);
    accountService = (module as TestingModule).get<AccountService>(
      AccountService,
    );
    jwtService = (module as TestingModule).get<JwtService>(JwtService);
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    describe('success', () => {
      beforeEach(async () => {
        mockAccountModel = createMockAccountModel();
        await createModule();
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

        expect(mockAccountModel.findOne).toHaveBeenCalledWith({
          username: expectedUsername,
        });
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
      describe('BadRequestException', () => {
        describe('When username does not exist in request', () => {
          beforeEach(async () => {
            mockAccountModel = createMockAccountModel();
            await createModule();
          });

          it('should throw BadRequestException', async () => {
            const signUpRequestDto: SignUpRequestDto = {
              username: '',
              password: expectedPassword,
            };

            await expect(
              accountService.signUp(signUpRequestDto),
            ).rejects.toThrow(BadRequestException);
          });
        });

        describe('When password does not exist in request', () => {
          beforeEach(async () => {
            mockAccountModel = createMockAccountModel();
            await createModule();
          });

          it('should throw BadRequestException', async () => {
            const signUpRequestDto: SignUpRequestDto = {
              username: expectedUsername,
              password: '',
            };

            await expect(
              accountService.signUp(signUpRequestDto),
            ).rejects.toThrow(BadRequestException);
          });
        });
      });

      describe('ConflictException', () => {
        describe('When there is an existing account already', () => {
          beforeEach(async () => {
            mockAccountModel = createMockAccountModel({
              findOne: jest.fn().mockImplementation(({ username }) => ({
                _id: expectedUserId,
                username: username,
                password: expectedHashedPassword,
              })),
            });
            await createModule();
          });

          it('should throw ConflictException', async () => {
            const signUpRequestDto: SignUpRequestDto = {
              username: expectedUsername,
              password: expectedPassword,
            };

            await expect(
              accountService.signUp(signUpRequestDto),
            ).rejects.toThrow(ConflictException);
          });
        });
      });

      describe('InternalServerErrorException', () => {
        describe('When hash fails', () => {
          beforeEach(async () => {
            mockAccountModel = createMockAccountModel();
            await createModule();
          });

          it('should throw InternalServerErrorException', async () => {
            const signUpRequestDto: SignUpRequestDto = {
              username: expectedUsername,
              password: expectedPassword,
            };
            (bcrypt.hash as jest.Mock).mockRejectedValueOnce(
              new Error('Failed to hash password'),
            );

            await expect(
              accountService.signUp(signUpRequestDto),
            ).rejects.toThrow(InternalServerErrorException);
          });
        });

        describe('When model.save fails', () => {
          beforeEach(async () => {
            mockAccountModel = createMockAccountModel({
              save: jest
                .fn()
                .mockRejectedValueOnce(new Error('Failed to save model')),
            });
            await createModule();
          });

          it('should throw InternalServerErrorException', async () => {
            const signUpRequestDto: SignUpRequestDto = {
              username: expectedUsername,
              password: expectedPassword,
            };
            (bcrypt.hash as jest.Mock).mockResolvedValue(
              expectedHashedPassword,
            );

            await expect(
              accountService.signUp(signUpRequestDto),
            ).rejects.toThrow(InternalServerErrorException);
          });
        });

        describe('When it does not return user id when storing a user', () => {
          beforeEach(async () => {
            mockAccountModel = createMockAccountModel({
              save: jest.fn().mockReturnValueOnce({
                _id: '',
                username: expectedUsername,
                password: expectedHashedPassword,
              }),
            });
            await createModule();
          });

          it('should throw InternalServerErrorException', async () => {
            const signUpRequestDto: SignUpRequestDto = {
              username: expectedUsername,
              password: expectedPassword,
            };
            (bcrypt.hash as jest.Mock).mockResolvedValue(
              expectedHashedPassword,
            );

            await expect(
              accountService.signUp(signUpRequestDto),
            ).rejects.toThrow(InternalServerErrorException);
          });
        });
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
