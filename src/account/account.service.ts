import { Injectable } from '@nestjs/common';
import { AccountModel } from './models/account.model';
import { AccountDto } from './dto/account.dto';

@Injectable()
export class AccountService {
  /**
   * Creates an account with given username and password and store it in DB.
   * @param username Username for new account.
   * @param password Password for new account.
   * @returns
   */
  async createAccount(username: string, password: string): Promise<AccountDto> {
    const account = new AccountModel({ username, password });

    const result = await account.save();
    const resultAccount = new AccountDto(
      result._id,
      result.username,
      result.password,
    );

    if (result._id && result.username && result.password) {
      // log that account is successfully stored
      return resultAccount;
    }

    throw new Error(`user ${username} is not successfully stored in database.`);
  }
}
