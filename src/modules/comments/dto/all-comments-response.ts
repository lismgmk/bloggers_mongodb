import { likeStatusType } from '../../likes/dto/like-interfaces';

export interface ICommentsRequest {
  id: string;
  content: string;
  userId: string;
  userName: string;
  createdAt: Date;
  likeInfo: {
    dislikesCount: number;
    likesCount: number;
    myStatus: likeStatusType;
  };
}
