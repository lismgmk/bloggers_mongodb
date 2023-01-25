import { ObjectId } from 'mongoose';

export interface ICondition {
  [key: string]: string | RegExp | ObjectId | boolean | any;
}
