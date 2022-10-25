import { likeStatusType } from 'modules/likes/dto/like-interfaces';

export interface IPostsRequest {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: {
    dislikesCount: number;
    likesCount: number;
    myStatus: likeStatusType;
    newestLikes: { addedAt: string; userId: string; login: string }[];
  };
}
