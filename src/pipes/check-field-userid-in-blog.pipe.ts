import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BlogsService } from '../modules/blogs/blogs.service';
import { Blog } from '../schemas/blog.schema';

@Injectable()
export class CheckFieldInUserIdInBlogPipe implements PipeTransform<any> {
  constructor(private readonly blogsService: BlogsService) {}
  async transform(value: string, argumentMetadata: ArgumentMetadata) {
    const blog = (await this.blogsService.getBlogById(value)) as Blog;
    // const object = plainToInstance(argumentMetadata.metatype, value);
    throw new BadRequestException();
    // const errors = await validate(object);
    if (!Object.is(blog.userId, null)) {
      throw new BadRequestException();
    }

    // const errorsArr = errors.map((el) => {
    //   return {
    //     message: Object.values(el.constraints)[0],
    //     field: el.property,
    //   };
    // });
    // if (errors.length > 0) {
    //   throw new BadRequestException(errorsArr);
    // }

    return value;
  }
}
