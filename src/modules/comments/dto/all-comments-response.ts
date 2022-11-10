import { likeStatusType } from '../../likes/dto/like-interfaces';

export interface ICommentsRequest {
  id: string;
  content: string;
  userId: string;
  userName: string;
  createdAt: Date;
  likesInfo: {
    dislikesCount: string;
    likesCount: string;
    myStatus: string;
    // dislikesCount: number;
    // likesCount: number;
    // myStatus: likeStatusType;
  };
}
