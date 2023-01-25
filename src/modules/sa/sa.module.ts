import { Module } from '@nestjs/common';
import { SaService } from './sa.service';
import { SaController } from './sa.controller';
import { BlogsService } from '../blogs/blogs.service';
import { BasicStrategy } from '../../strategyes/auth-basic.strategy';
import { GetBlogsHandler } from '../blogs/queries/handler/get-blogs.handler';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { PostsService } from '../posts/posts.service';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../../schemas/blog.schema';
import { Like, LikeSchema } from '../../schemas/likes.schema';
import { Posts, PostsSchema } from '../../schemas/posts/posts.schema';
import { IfNotFoundBlogIdDropError } from '../../dto-validator/if-not-found-blog-id-drop-error';
import { LikesService } from '../likes/likes.service';
import { BlogsQueryRepository } from '../blogs/blogs.query.repository';
import { UsersService } from '../users/users.service';
import { User, UserSchema } from '../../schemas/users/users.schema';
import { JwtService } from '@nestjs/jwt';
import { JwtPassService } from '../common-services/jwt-pass-custom/jwt-pass.service';
import { UsersQueryRepository } from '../users/users.query.repository';
import { SecurityService } from '../security/security.service';
import { Devices, DevicesSchema } from '../../schemas/device.schema';
import {
  BanInfoBlogger,
  BanInfoBloggerSchema,
} from '../../schemas/banBlogger/ban-blogger.schema';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Posts.name, schema: PostsSchema },
      { name: Like.name, schema: LikeSchema },
      { name: User.name, schema: UserSchema },
      { name: Devices.name, schema: DevicesSchema },
      { name: BanInfoBlogger.name, schema: BanInfoBloggerSchema },
    ]),
    CqrsModule,
  ],
  controllers: [SaController],
  providers: [
    SaService,
    BlogsService,
    BasicStrategy,
    GetBlogsHandler,
    PostsQueryRepository,
    PostsService,
    LikesService,
    IfNotFoundBlogIdDropError,
    BlogsQueryRepository,
    UsersService,
    JwtService,
    JwtPassService,
    UsersQueryRepository,
    SecurityService,
  ],
})
export class SaModule {}
