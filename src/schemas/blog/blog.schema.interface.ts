import { Types } from 'mongoose';

export interface IBlog {
  name: string;
  description: string;
  websiteUrl: string;
  userId: Types.ObjectId;
  createdAt: string;
  banInfo: IBanInfo;
}

export interface IBanInfo {
  isBanned: boolean;
  banDate: string;
}
