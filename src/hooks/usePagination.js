import { useState, useCallback } from 'react';

export const usePagination = (initialPage = 1, initialLimit = 20) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(initialLimit);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const updatePaginationData = useCallback((total, limit = itemsPerPage) => {
    setTotalPages(Math.ceil(total / limit));
    setTotalItems(total);
  }, [itemsPerPage]);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setTotalPages(1);
    setTotalItems(0);
  }, []);

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    updatePaginationData,
    resetPagination
  };
};
