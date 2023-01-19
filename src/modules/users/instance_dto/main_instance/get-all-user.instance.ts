import { PaginationQueryMain } from '../../../../global-dto/main_interfaces/pagination-query.interface';
import { SortByBanStatus, SortByField } from '../dto_transfer/field-params';

export class GetAllUsersMain extends PaginationQueryMain {
  searchLoginTerm: string;
  searchEmailTerm: string;
  sortBy: keyof typeof SortByField = 'createdAt';
  banStatus: keyof typeof SortByBanStatus = 'all';
}
