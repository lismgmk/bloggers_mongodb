import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { validationSchema } from '../config/validation';
import { CheckBearerMiddleware } from '../middlewares/check-bearer.middleware';
import { IpUsersRepository } from '../repositotyes/ip-user.repository';
import { BlackList, BlackListSchema } from '../schemas/black-list.schema';
import { IpUser, IpUserSchema } from '../schemas/iPusers.schema';
import { User, UserSchema } from '../schemas/users.schema';
import { AuthModule } from './auth/auth.module';
import { BlogsModule } from './blogs/blogs.module';
import { CommentsModule } from './comments/comments.module';
import { JwtPassModule } from './common-services/jwt-pass-custom/jwt-pass.module';
import { JwtPassService } from './common-services/jwt-pass-custom/jwt-pass.service';
import { MailModule } from './common-services/mail/mail.module';
import { LikesModule } from './likes/likes.module';
import { PostsModule } from './posts/posts.module';
import { SecurityModule } from './security/security.module';
import { TestingModule } from './testing/testing.module';
import { UsersModule } from './users/users.module';
import { UsersRepository } from './users/users.repository';

@Module({
  imports: [
    SecurityModule,
    // ConfigModule.forRoot({ isGlobal: true, validationSchema }),
    ConfigModule.forRoot({ isGlobal: true }),
    BlogsModule,
    AuthModule,
    CommentsModule,
    PostsModule,
    TestingModule,
    UsersModule,
    PassportModule,
    MongooseModule.forRoot(
      process.env.DB_CONNECT_MONGOOSE ||
        'mongodb://root:example@localhost:27017/bloggers_posts?authSource=admin',
    ),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: IpUser.name, schema: IpUserSchema },
      { name: BlackList.name, schema: BlackListSchema },
    ]),
    MailModule,
    LikesModule,
    JwtPassModule,
  ],
  controllers: [],
  providers: [IpUsersRepository, JwtPassService, UsersRepository, JwtService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(CheckIpStatusMiddleware).forRoutes(
    //   { path: '/auth/registration', method: RequestMethod.POST },
    //   { path: 'users/:id', method: RequestMethod.DELETE },
    //   { path: 'refresh-token', method: RequestMethod.POST },
    // );
    consumer.apply(CheckBearerMiddleware).forRoutes(
      {
        path: '/posts/:postId/comments',
        method: RequestMethod.GET,
      },
      {
        path: '/blogs/:postId/posts',
        method: RequestMethod.GET,
      },
      {
        path: '/posts',
        method: RequestMethod.GET,
      },
      {
        path: '/posts/:postId/comments',
        method: RequestMethod.GET,
      },
      {
        path: '/posts/:postId',
        method: RequestMethod.GET,
      },
      {
        path: '/comments/:id',
        method: RequestMethod.GET,
      },
    );
  }
}
