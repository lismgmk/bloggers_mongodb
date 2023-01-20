export const getSortDirection = (sortDirection: string) => {
  if (!sortDirection) {
    return -1;
  }
  return sortDirection === 'asc' ? 1 : -1;
};
