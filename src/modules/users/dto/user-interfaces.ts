export interface IPaginationResponse<Item> extends IPagination {
  items?: Item[] | [];
}

export interface IPagination {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount?: number;
}

export interface IUser {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}
