import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../blogs/blogs.query.repository';
import { GetAllBlogsQueryType } from '../blogs/types/blogs.type';

@Injectable()
export class SaService {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}
  async getAllBlogsSa(queryParams: GetAllBlogsQueryType) {
    return this.blogsQueryRepository.queryAllBlogsPagination(queryParams);
  }
}
