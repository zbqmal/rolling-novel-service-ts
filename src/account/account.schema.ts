import { Schema } from 'mongoose';

export const AccountSchema = new Schema({
  username: String,
  password: String,
  // Add other fields as needed
});
