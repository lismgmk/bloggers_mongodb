import { IPagination } from '../global-dto/common-interfaces';

export interface paramsDto {
  totalCount: number;
  pageSize: number;
  pageNumber: number;
}

export const paginationBuilder = (params: paramsDto): IPagination => {
  const totalPages = Math.ceil((params.totalCount || 0) / params.pageSize);
  return {
    pagesCount: totalPages,
    page: params.pageNumber,
    pageSize: params.pageSize,
    totalCount: params.totalCount,
  };
};
