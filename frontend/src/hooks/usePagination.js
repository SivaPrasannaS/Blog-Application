import { useMemo, useState } from 'react';

export const usePagination = (initialPage = 0, initialSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);

  return useMemo(
    () => ({
      page,
      size,
      setPage,
      setSize,
      nextPage: () => setPage((currentPage) => currentPage + 1),
      prevPage: () => setPage((currentPage) => Math.max(0, currentPage - 1))
    }),
    [page, size]
  );
};

export default usePagination;