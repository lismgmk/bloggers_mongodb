import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId } from 'mongoose';
import { LikeInfoRequest } from '../../global-dto/like-info.request';
import { LikeStatusEnum } from '../../global-dto/like-status.dto';
import { Blog } from '../../schemas/blog.schema';
import { Posts } from '../../schemas/posts/posts.schema';
import { User } from '../../schemas/users/users.schema';
import { BlogsService } from '../blogs/blogs.service';
import { LikesService } from '../likes/likes.service';
import { GetAllPostsdDto } from './instance_dto/dto_validate/get-all-posts.dto';
import { CreatePostWithBlogIdMain } from './instance_dto/main_instance/create-post.interface';
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
  async getPostByIdWithLikes(id: string) {
    return this.postsQueryRepository.queryPostById(id);
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

  async createPost(dto: CreatePostWithBlogIdMain) {
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
      userId: dto.userId,
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
  async changePost(id: string, dto: CreatePostWithBlogIdMain) {
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
