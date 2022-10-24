import { likeStatusType } from './../likes/dto/like-interfaces';
import { Blog } from 'schemas/blog.schema';
import { BlogsService } from './../blogs/blogs.service';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Posts } from 'schemas/posts.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { GetAllPostsdDto } from './dto/get-all-posts.dto';
import { LikeInfoRequest } from 'global-dto/like-info.request';
import { User } from 'schemas/users.schema';
import { LikesService } from 'modules/likes/likes.service';
import { LikeStatusEnum } from 'global-dto/like-status.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Posts.name) private postModel: Model<Posts>,
    private blogsService: BlogsService,
    private likesService: LikesService,
  ) {}
  async getAllPosts(
    queryParams: GetAllPostsdDto, // : Promise<IPaginationResponse<Post>>
  ) {
    const sortField = queryParams.sortBy;
    const sortValue = queryParams.sortDirection;

    return await this.postModel.aggregate([
      {
        $sort: {
          [sortField]: 1,
        },
      },
      {
        $skip:
          queryParams.pageNumber > 0
            ? (queryParams.pageNumber - 1) * queryParams.pageSize
            : 0,
      },
      { $limit: queryParams.pageSize },
      {
        $lookup: {
          from: 'Like',
          localField: '_id',
          foreignField: 'blogId',
          as: 'likes',
        },
      },
    ]);

    // const allPosts: Post[] = (
    //   await this.postModel
    //     .find({})
    //     .sort({ [queryParams.sortBy]: queryParams.sortDirection })
    //     .skip(
    //       queryParams.pageNumber > 0
    //         ? (queryParams.pageNumber - 1) * queryParams.pageSize
    //         : 0,
    //     )
    //     .limit(queryParams.pageSize)
    //     .lean()
    // ).map((i) => {
    //   return {
    //     id: i._id,
    //     title: i.title,
    //     createdAt: i.createdAt,
    //     youtubeUrl: i.youtubeUrl,
    //   };
    // });
    // const totalCount = await this.blogsModel.countDocuments().exec();
    // const paginationParams: paramsDto = {
    //   totalCount: totalCount,
    //   pageSize: queryParams.pageSize,
    //   pageNumber: queryParams.pageNumber,
    // };
    // return {
    //   ...paginationBuilder(paginationParams),
    //   items: allBlogs,
    // };
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

  async createPost(dto: CreatePostDto) {
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
      bloggerId: dto.blogId,
      createdAt: new Date(),
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
}
//  "id": "string",
//       "title": "string",
//       "shortDescription": "string",
//       "content": "string",
//       "blogId": "string",
//       "blogName": "string",
//       "createdAt": "2022-10-23T18:54:02.535Z",
//       "extendedLikesInfo": {
//         "likesCount": 0,
//         "dislikesCount": 0,
//         "myStatus": "None",
//         "newestLikes": [
//           {
//             "addedAt": "2022-10-23T18:54:02.535Z",
//             "userId": "string",
//             "login": "string"
//           }
//         ]
//       }
