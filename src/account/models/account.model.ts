import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { AccountSchema } from '../schemas/account.schema';

export const AccountModel: Model<any> = mongoose.model(
  'Account',
  AccountSchema,
);
