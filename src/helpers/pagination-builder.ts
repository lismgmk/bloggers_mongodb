import { IPagination } from 'src/modules/users/dto/user-interfaces';
import { pageSize } from './../test-params/test-values';

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
    pageSize,
    totalCount: params.totalCount,
  };
};
