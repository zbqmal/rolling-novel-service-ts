import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { AccountModel } from './models/account.model';
import { Model } from 'mongoose';

jest.mock('./models/account.model');

describe('AccountService', () => {
  let service: AccountService;
  let mockAccountModel = new AccountModel();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountService],
    }).compile();

    service = module.get<AccountService>(AccountService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    it('should create an account and return it', async () => {
      const expectedId = 'test-id';
      const expectedUsername = 'test-username';
      const expectedPassword = 'test-password';
      const mockAccountData = {
        _id: expectedId,
        expectedUsername,
        expectedPassword,
      };
      const mockSavedAccount = new AccountModel(mockAccountData);

      mockAccountModel.save = jest.fn().mockResolvedValue(mockSavedAccount);
    });
  });
});
