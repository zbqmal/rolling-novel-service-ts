import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { SignUpRequestDto } from './dto/sign-up-request.dto';

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
        username: 'test_username',
        password: 'test_password',
      };
      await accountController.signUp(signUpRequestDto);

      expect(accountService.signUp).toHaveBeenCalledWith(signUpRequestDto);
    });
  });

  //   describe('signIn', () => {
  //     it('should call accountService.signIn with the correct parameters', async () => {
  //       const username = 'test@example.com';
  //       const password = 'password123';
  //       await accountController.signIn(username, password);

  //       expect(accountService.signIn).toHaveBeenCalledWith(username, password);
  //     });
  //   });
});
