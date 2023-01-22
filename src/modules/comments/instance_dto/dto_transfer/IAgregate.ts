import { Types } from 'mongoose';
import { GetAllCommentsMain } from '../main_instance/get-all-comments.instance';

export interface IAgregateComments extends IAgregateCommentById {
  queryParams: GetAllCommentsMain;
  sortField: string;
  sortValue: 1 | -1;
  userId: string;
  unset: string[];
}

export interface IAgregateCommentById {
  singleCondition: { [key: string]: string | RegExp | Types.ObjectId };
  bannedUsers: Types.ObjectId[];
}
