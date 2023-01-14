import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../blogs/blogs.query.repository';
import { GetAllBlogsQueryMain } from '../blogs/instance_dto/main_instance/get-all-blogs.instance';
import { BanUserMain } from '../users/instance_dto/main_instance/ban-user.instance';
import { UsersService } from '../users/users.service';

@Injectable()
export class SaService {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly usersService: UsersService,
    
    ) {}
  async getAllBlogsSa(queryParams: GetAllBlogsQueryMain) {
    return this.blogsQueryRepository.queryAllBlogsPagination(queryParams);
  }

  async changeBanStatus(id: string, banDto: BanUserMain){
    return this.usersService.changeStatus(id, banDto)
  }
}
