import { PaginationQueryMain } from '../../../../global-dto/main_interfaces/pagination-query.interface';
export enum SortByFielComment {
  createdAt,
  userLogin,
  content,
}
export class GetAllCommentsMain extends PaginationQueryMain {
  sortBy: keyof typeof SortByFielComment = 'createdAt';
}
