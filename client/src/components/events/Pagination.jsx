import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../common/Button';

export const Pagination = ({ page, pages, onPageChange }) => {
  const pageNumbers = [];
  const maxPages = Math.min(pages, 5);
  let startPage = Math.max(1, page - Math.floor(maxPages / 2));
  let endPage = Math.min(pages, startPage + maxPages - 1);

  if (endPage - startPage + 1 < maxPages) {
    startPage = Math.max(1, endPage - maxPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center items-center gap-2 mt-8"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        Previous
      </Button>

      {startPage > 1 && (
        <>
          <Button variant="outline" size="sm" onClick={() => onPageChange(1)}>
            1
          </Button>
          {startPage > 2 && <span className="text-gray-500">...</span>}
        </>
      )}

      {pageNumbers.map((num) => (
        <Button
          key={num}
          variant={page === num ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onPageChange(num)}
        >
          {num}
        </Button>
      ))}

      {endPage < pages && (
        <>
          {endPage < pages - 1 && <span className="text-gray-500">...</span>}
          <Button variant="outline" size="sm" onClick={() => onPageChange(pages)}>
            {pages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
      >
        Next
      </Button>
    </motion.div>
  );
};
