import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { CheckIpStatusMiddleware } from '../midlvares/check-ip-status.middleware';
import { IpUsersRepository } from '../repositotyes/ip-user.repository';
import { BlackList, BlackListSchema } from '../schemas/black-list.schema';
import { IpUser, IpUserSchema } from '../schemas/iPusers.schema';
import { User, UserSchema } from '../schemas/users.schema';
import { AuthModule } from './auth/auth.module';
import { BlogsModule } from './blogs/blogs.module';
import { CommentsModule } from './comments/comments.module';
import { PostsModule } from './posts/posts.module';
import { TestingModule } from './testing/testing.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './common-services/mail/mail.module';
import { JwtPassModule } from './common-services/jwt-pass/jwt-pass.module';
import { LikesModule } from './likes/likes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BlogsModule,
    AuthModule,
    CommentsModule,
    PostsModule,
    TestingModule,
    UsersModule,
    PassportModule,
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DB_CONN_MONGOOSE_STRING'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: IpUser.name, schema: IpUserSchema },
      { name: BlackList.name, schema: BlackListSchema },
    ]),
    MailModule,
    JwtPassModule,
    LikesModule,
  ],
  controllers: [],
  providers: [IpUsersRepository],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CheckIpStatusMiddleware)
      .forRoutes(
        { path: '/auth/registration', method: RequestMethod.POST },
        { path: 'users/:id', method: RequestMethod.DELETE },
        { path: 'refresh-token', method: RequestMethod.POST },
      );
  }
}
