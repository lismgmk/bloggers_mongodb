import { PaginationQueryDto } from '../../../../global-dto/dto_validate/pagination-query.dto';

export enum SortByField {
  name,
  createdAt,
  description,
  websiteUrl,
}
export class GetAllBlogsQueryMain extends PaginationQueryDto {
  searchNameTerm: string;
  sortBy: keyof typeof SortByField = 'createdAt';
}
