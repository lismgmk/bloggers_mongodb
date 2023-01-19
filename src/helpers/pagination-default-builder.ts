import { IPaginationResponse } from '../global-dto/common-interfaces';

export interface paramsDto {
  pageSize: number;
  pageNumber: number;
}

export const paginationDefaultBuilder = (
  params: paramsDto,
): IPaginationResponse<[]> => {
  return {
    pagesCount: 0,
    page: params.pageNumber,
    pageSize: params.pageSize,
    totalCount: 0,
    items: [],
  };
};
