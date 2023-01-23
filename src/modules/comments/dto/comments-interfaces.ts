import { ObjectId } from 'mongoose';
export interface ICreateComment {
  postId: ObjectId | string;
  userId: ObjectId | string;
  content: string;
  userLogin: string;
  blogId: ObjectId | string;
}
