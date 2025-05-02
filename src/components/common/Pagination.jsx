import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    // Generate page numbers array
    const getPageNumbers = () => {
        const pageNumbers = [];

        // Always include first page
        pageNumbers.push(1);

        // Calculate range around current page
        const leftBound = Math.max(2, currentPage - 1);
        const rightBound = Math.min(totalPages - 1, currentPage + 1);

        // Add ellipsis if needed before leftBound
        if (leftBound > 2) {
            pageNumbers.push('...');
        }

        // Add pages in range
        for (let i = leftBound; i <= rightBound; i++) {
            pageNumbers.push(i);
        }

        // Add ellipsis if needed after rightBound
        if (rightBound < totalPages - 1) {
            pageNumbers.push('...');
        }

        // Always include last page if more than one page
        if (totalPages > 1) {
            pageNumbers.push(totalPages);
        }

        return pageNumbers;
    };

    const pageNumbers = getPageNumbers();

    return (
        <nav className="flex items-center justify-between border-t border-neutral-200 px-4 sm:px-0">
            <div className="hidden md:-mt-px md:flex">
                {/* Previous page button */}
                <button
                    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium ${
                        currentPage === 1
                            ? 'cursor-not-allowed text-neutral-300'
                            : 'text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                    }`}
                >
                    <ChevronLeftIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                    Previous
                </button>

                {/* Page numbers */}
                <div className="flex">
                    {pageNumbers.map((page, index) => (
                        <React.Fragment key={index}>
                            {page === '...' ? (
                                <span className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-neutral-500">
                                    ...
                                </span>
                            ) : (
                                <button
                                    onClick={() => onPageChange(page)}
                                    className={`inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium ${
                                        currentPage === page
                                            ? 'border-primary-500 text-primary-600'
                                            : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                                    }`}
                                >
                                    {page}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Next page button */}
                <button
                    onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium ${
                        currentPage === totalPages
                            ? 'cursor-not-allowed text-neutral-300'
                            : 'text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                    }`}
                >
                    Next
                    <ChevronRightIcon className="ml-3 h-5 w-5" aria-hidden="true" />
                </button>
            </div>

            {/* Mobile pagination */}
            <div className="flex w-full items-center justify-between md:hidden">
                <button
                    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium ${
                        currentPage === 1
                            ? 'cursor-not-allowed text-neutral-300'
                            : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                >
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    <span className="ml-1">Previous</span>
                </button>

                <div className="text-sm text-neutral-700">
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                </div>

                <button
                    onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium ${
                        currentPage === totalPages
                            ? 'cursor-not-allowed text-neutral-300'
                            : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                >
                    <span className="mr-1">Next</span>
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
            </div>
        </nav>
    );
};

export default Pagination;