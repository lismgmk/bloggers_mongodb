import { Types } from 'mongoose';

export class PostsMain {
  createdAt: string;
  shortDescription: string;
  content: string;
  title: string;
  blogId: Types.ObjectId;
  blogName: string;
  userId: Types.ObjectId;
}
