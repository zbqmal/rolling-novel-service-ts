import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import { SignInRequestDto } from './dto/sign-in-request.dto';

const testUsername = 'test_username';
const testPassword = 'test_password';

describe('AccountController', () => {
  let accountController: AccountController;
  let accountService: AccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: {
            signUp: jest.fn(),
            signIn: jest.fn(),
          },
        },
      ],
    }).compile();

    accountController = module.get<AccountController>(AccountController);
    accountService = module.get<AccountService>(AccountService);
  });

  it('should be defined', () => {
    expect(accountController).toBeDefined();
  });

  describe('signUp', () => {
    it('should call accountService.signUp with the correct parameters', async () => {
      const signUpRequestDto: SignUpRequestDto = {
        username: testUsername,
        password: testPassword,
      };
      await accountController.signUp(signUpRequestDto);

      expect(accountService.signUp).toHaveBeenCalledWith(signUpRequestDto);
    });
  });

  describe('signIn', () => {
    it('should call accountService.signIn with the correct parameters', async () => {
      const signInRequestDto: SignInRequestDto = {
        username: testUsername,
        password: testPassword,
      };
      await accountController.signIn(signInRequestDto);

      expect(accountService.signIn).toHaveBeenCalledWith(signInRequestDto);
    });
  });
});
