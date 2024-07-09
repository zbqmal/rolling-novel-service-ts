import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AccountDocument = Account & Document;

@Schema()
export class Account {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  _id: string;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
