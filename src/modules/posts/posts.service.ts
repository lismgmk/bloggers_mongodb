import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId } from 'mongoose';
import { LikeInfoRequest } from '../../global-dto/like-info.request';
import { LikeStatusEnum } from '../../global-dto/like-status.dto';
import { Blog } from '../../schemas/blog.schema';
import { Posts } from '../../schemas/posts.schema';
import { User } from '../../schemas/users.schema';
import { BlogsService } from '../blogs/blogs.service';
import { LikesService } from '../likes/likes.service';
import { CreatePostWithBlogIdDto } from './dto/create-post-with-blog-id.dto';
import { GetAllPostsdDto } from './dto/get-all-posts.dto';
import { PostsQueryRepository } from './posts.query.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Posts.name) private postModel: Model<Posts>,
    private blogsService: BlogsService,
    private likesService: LikesService,
    private postsQueryRepository: PostsQueryRepository,
  ) {}
  async getAllPosts(queryParams: GetAllPostsdDto, userId: string) {
    return this.postsQueryRepository.queryAllPostsPagination(
      queryParams,
      null,
      userId,
    );
  }
  async getPostByIdWithLikes(id: string, userId: string) {
    return this.postsQueryRepository.queryPostById(id, userId);
  }
  async getPostById(id: string | ObjectId) {
    return await this.postModel.findById(id).exec();
  }

  async addLikeStatusePost(
    user: User,
    likeStatus: keyof typeof LikeStatusEnum,
    postId: string | ObjectId,
  ) {
    const currentPost = await this.getPostById(postId);
    if (!currentPost) {
      throw new NotFoundException();
    }
    await this.likesService.upDateLikesInfo({
      postId,
      commentId: null,
      status: likeStatus,
      userId: user._id,
      login: user.accountData.userName,
    });
  }

  async createPost(dto: CreatePostWithBlogIdDto) {
    const currentBlog = (await this.blogsService.getBlogById(
      dto.blogId,
    )) as Blog;
    if (!currentBlog) {
      throw new BadRequestException({
        message: { message: 'blog does not found', field: 'blogId' },
      });
    }
    const newPost = new this.postModel({
      title: dto.title,
      content: dto.content,
      shortDescription: dto.shortDescription,
      blogId: dto.blogId,
      blogName: currentBlog.name,
      createdAt: new Date().toISOString(),
    });
    const createdPost = (await this.postModel.create(newPost)) as Posts;

    const extendedLikesInfo: LikeInfoRequest = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    };
    return {
      id: createdPost._id,
      title: createdPost.title,
      shortDescription: createdPost.shortDescription,
      content: createdPost.content,
      blogId: currentBlog._id,
      blogName: currentBlog.name,
      createdAt: createdPost.createdAt,
      extendedLikesInfo,
    };
  }
  async changePost(id: string, dto: CreatePostWithBlogIdDto) {
    const post = (await this.getPostById(id)) as Posts;
    if (!post) {
      throw new NotFoundException();
    }
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.blogId = new mongoose.Types.ObjectId(dto.blogId);
    post.save();
  }

  async deletePostById(id: string | ObjectId) {
    const post = this.getPostById(id);
    if (!post) {
      throw new NotFoundException();
    }
    return this.postModel.findByIdAndDelete(id);
  }
}
