import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsModule } from './blogs/blogs.module';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { PostsModule } from './posts/posts.module';
import { TestingModule } from './testing/testing.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BlogsModule,
    AuthModule,
    CommentsModule,
    PostsModule,
    TestingModule,
    UsersModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DB_CONNECT_LOCAL_MONGOOSE'),
        //uri: configService.get<string>('DB_CONN_MONGOOSE_STRING'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
