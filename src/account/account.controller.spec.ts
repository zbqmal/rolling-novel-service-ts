import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';

describe('AccountController', () => {
  let controller: AccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
    }).compile();

    controller = module.get<AccountController>(AccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('SignIn', () => {
    it('should return dummy string', () => {
      const result = controller.signIn();
      expect(result).toContain('SignIn');
    });
  });

  describe('SignIn', () => {
    it('should return dummy string', () => {
      const result = controller.signUp();
      expect(result).toContain('SignUp');
    });
  });
});
