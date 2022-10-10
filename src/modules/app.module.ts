import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './auth/auth.module';
import { BlogsModule } from './blogs/blogs.module';
import { CommentsModule } from './comments/comments.module';
import { PostsModule } from './posts/posts.module';
import { TestingModule } from './testing/testing.module';
import { UsersModule } from './users/users.module';

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
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     secret: configService.get<string>('SECRET'),
    //     signOptions: {
    //       expiresIn: configService.get<string>('EXPIRED_ACCESS'),
    //     },
    //   }),
    //   inject: [ConfigService],
    // }),
    // JwtModule.register({
    //   secret: 'secret',
    //   signOptions: { expiresIn: '60s' },
    // }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DB_CONN_MONGOOSE_STRING'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
