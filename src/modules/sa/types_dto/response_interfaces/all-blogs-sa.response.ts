import { IBlog } from '../../../blogs/dto/blogs-intergaces';

interface IUserSa {
  userId: string;
  userLogin: string;
}

export interface IAllBlogsSaResponse extends IBlog {
  blogOwnerInfo: IUserSa;
}
