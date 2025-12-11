import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const UserPagination = ({ 
  currentPage, 
  totalPages, 
  pageSize, 
  totalElements, 
  handlePageChange 
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Hiển thị <span className="font-medium">{currentPage * pageSize + 1}</span> đến{" "}
        <span className="font-medium">{Math.min((currentPage + 1) * pageSize, totalElements)}</span>{" "}
        trong tổng số{" "}
        <span className="font-medium">{totalElements}</span> kết quả
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i;
            } else if (currentPage < 3) {
              pageNum = i;
            } else if (currentPage >= totalPages - 3) {
              pageNum = totalPages - 5 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 rounded text-sm ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {pageNum + 1}
              </button>
            );
          })}
        </div>
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default UserPagination;