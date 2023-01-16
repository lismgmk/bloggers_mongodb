import { PaginationQueryMain } from '../../../../global-dto/main_interfaces/pagination-query.interface';

export enum SortByField {
  login,
  createdAt,
  email,
  attemptCount,
}

export class GetAllUsersMain extends PaginationQueryMain {
  searchLoginTerm: string;
  searchEmailTerm: string;
  sortBy: keyof typeof SortByField = 'createdAt';
}
