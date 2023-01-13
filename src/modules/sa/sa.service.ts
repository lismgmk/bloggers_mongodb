import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../blogs/blogs.query.repository';
import { GetAllBlogsQueryMain } from '../blogs/instance_dto/main_instance/get-all-blogs.instance';

@Injectable()
export class SaService {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}
  async getAllBlogsSa(queryParams: GetAllBlogsQueryMain) {
    return this.blogsQueryRepository.queryAllBlogsPagination(queryParams);
  }
}
