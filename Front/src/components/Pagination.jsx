import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center py-4 space-x-2">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-2 rounded-md border bg-green-600 text-white hover:bg-green-500 disabled:opacity-100 flex items-center space-x-1"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Précédent</span>
      </button>

      <span className="text-gray-700 text-sm">
        Page {currentPage} sur {totalPages}
      </span>

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-2 rounded-md border bg-green-600 text-white hover:bg-green-200 disabled:opacity-100 flex items-center space-x-1"
      >
        <span>Suivant</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
