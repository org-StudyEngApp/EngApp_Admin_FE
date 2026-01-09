import React from 'react';

/**
 * Pagination Component
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const maxPagesToShow = 5;

  let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(0, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-600">
        Trang {currentPage + 1} / {totalPages}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Trước
        </button>

        {startPage > 0 && (
          <>
            <button
              onClick={() => onPageChange(0)}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              1
            </button>
            {startPage > 1 && <span className="px-2 py-1">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 border rounded ${
              currentPage === page
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page + 1}
          </button>
        ))}

        {endPage < totalPages - 1 && (
          <>
            {endPage < totalPages - 2 && <span className="px-2 py-1">...</span>}
            <button
              onClick={() => onPageChange(totalPages - 1)}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sau →
        </button>
      </div>
    </div>
  );
};

export default Pagination;
