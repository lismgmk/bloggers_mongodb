import { Types } from 'mongoose';

export class CommentsMain {
  createdAt: string;
  content: string;
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  blogId: Types.ObjectId;
  userLogin: string;
}
