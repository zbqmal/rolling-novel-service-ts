import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

describe('AccountController', () => {
  let controller: AccountController;
  let service: AccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [AccountService]
    }).compile();

    controller = module.get<AccountController>(AccountController);
    service = module.get<AccountService>(AccountService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should return dummy string', () => {
      const result = controller.signIn();
      expect(result).toContain('SignIn');
    });
  });

  describe('signUp', () => {
    it('should create a new account', () => {
      const result = controller.signUp();
      expect(result).toContain('SignUp');
    });
  });
});
