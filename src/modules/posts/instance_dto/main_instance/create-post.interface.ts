import { CreatePostMain } from './create-post.instance';

export interface CreatePostWithBlogIdMain extends CreatePostMain {
  blogId: string;
  userId: string;
}
