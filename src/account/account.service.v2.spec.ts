import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { Account, AccountDocument } from './schemas/account.schema';
import * as bcrypt from 'bcryptjs';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';

describe('AccountService', () => {
  let service: AccountService;
  let model: Model<AccountDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: getModelToken(Account.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn().mockResolvedValue([{
              _id: 'someId',
              username: 'testuser',
              password: 'hashedpassword',
              save: jest.fn(),
            }]),
          },
        },
        JwtService,
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    model = module.get<Model<AccountDocument>>(getModelToken(Account.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      const request: SignUpRequestDto = {
        username: 'testuser',
        password: 'testpassword',
      };

      jest.spyOn(model, 'findOne').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword');

      const result = await service.signUp(request);

      expect(result).toEqual({
        userId: 'someId',
        username: 'testuser',
      });
      expect(model.findOne).toHaveBeenCalledWith({ username: request.username });
      expect(bcrypt.hash).toHaveBeenCalledWith(request.password, 10);
      expect(model.create).toHaveBeenCalledWith({
        username: request.username,
        password: 'hashedpassword',
      });
    });

    it('should throw a ConflictException if the username already exists', async () => {
      const request: SignUpRequestDto = {
        username: 'existinguser',
        password: 'testpassword',
      };

      const existingAccount: AccountDocument = {
        _id: 'existingId',
        username: 'existinguser',
        password: 'hashedpassword',
        save: jest.fn(),
      } as unknown as AccountDocument;

      jest.spyOn(model, 'findOne').mockResolvedValue(existingAccount);

      await expect(service.signUp(request)).rejects.toThrow(ConflictException);
      expect(model.findOne).toHaveBeenCalledWith({ username: request.username });
    });

    it('should throw an InternalServerErrorException for unexpected errors', async () => {
      const request: SignUpRequestDto = {
        username: 'newuser',
        password: 'testpassword',
      };

      jest.spyOn(model, 'findOne').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockRejectedValue(new Error('Hashing error'));

      await expect(service.signUp(request)).rejects.toThrow(InternalServerErrorException);
      expect(model.findOne).toHaveBeenCalledWith({ username: request.username });
      expect(bcrypt.hash).toHaveBeenCalledWith(request.password, 10);
    });
  });
});