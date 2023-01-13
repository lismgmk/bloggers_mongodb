export enum SortDirection {
  desc,
  asc,
}

export class PaginationQueryMain {
  sortDirection: keyof typeof SortDirection = 'asc';
  pageNumber = 1;
  pageSize = 10;
}
