import { likeStatusType } from '../../../likes/dto/like-interfaces';
import { CreatePostWithBlogIdMain } from '../main_instance/create-post.interface';

export interface IPostsRequest extends CreatePostWithBlogIdMain {
  id: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: {
    dislikesCount: number;
    likesCount: number;
    myStatus: likeStatusType;
    newestLikes: { addedAt: string; userId: string; login: string }[];
  };
}
