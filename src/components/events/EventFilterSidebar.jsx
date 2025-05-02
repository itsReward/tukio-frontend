import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
    CalendarIcon,
    MagnifyingGlassIcon,
    TagIcon,
    AdjustmentsHorizontalIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const EventFilterSidebar = ({ filters, categories, onFilterChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);
    const [tagInput, setTagInput] = useState('');

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters({
            ...localFilters,
            [name]: value
        });
    };

    // Handle category change
    const handleCategoryChange = (e) => {
        const value = e.target.value ? Number(e.target.value) : null;
        setLocalFilters({
            ...localFilters,
            categoryId: value
        });
    };

    // Handle date range changes
    const handleDateChange = (dates) => {
        const [start, end] = dates;
        setLocalFilters({
            ...localFilters,
            startFrom: start,
            startTo: end
        });
    };

    // Handle tag input
    const handleTagInputChange = (e) => {
        setTagInput(e.target.value);
    };

    // Add tag to filters
    const handleAddTag = (e) => {
        e.preventDefault();
        if (tagInput.trim() && !localFilters.tags.includes(tagInput.trim())) {
            const updatedTags = [...localFilters.tags, tagInput.trim()];
            setLocalFilters({
                ...localFilters,
                tags: updatedTags
            });
            setTagInput('');
        }
    };

    // Remove tag from filters
    const handleRemoveTag = (tagToRemove) => {
        setLocalFilters({
            ...localFilters,
            tags: localFilters.tags.filter(tag => tag !== tagToRemove)
        });
    };

    // Apply filters
    const applyFilters = () => {
        onFilterChange(localFilters);
    };

    // Clear all filters
    const clearFilters = () => {
        const resetFilters = {
            keyword: '',
            categoryId: null,
            startFrom: null,
            startTo: null,
            tags: [],
        };
        setLocalFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    // Toggle mobile filter view
    const toggleMobileFilter = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Mobile filter toggle */}
            <button
                className="lg:hidden flex items-center mb-4 text-neutral-700 font-medium"
                onClick={toggleMobileFilter}
            >
                <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
                {isOpen ? 'Hide Filters' : 'Show Filters'}
            </button>

            {/* Filter sidebar */}
            <div className={`bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-screen' : 'max-h-0 lg:max-h-screen hidden lg:block'}`}>
                <div className="p-5 border-b border-neutral-200">
                    <h2 className="text-lg font-semibold text-neutral-900">Filter Events</h2>
                </div>

                <div className="p-5 space-y-6">
                    {/* Search keyword */}
                    <div>
                        <label htmlFor="keyword" className="block text-sm font-medium text-neutral-700 mb-1">
                            Search
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                            </div>
                            <input
                                type="text"
                                name="keyword"
                                id="keyword"
                                className="form-input pl-10"
                                placeholder="Search events"
                                value={localFilters.keyword}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1">
                            Category
                        </label>
                        <select
                            id="category"
                            name="category"
                            className="form-select"
                            value={localFilters.categoryId || ''}
                            onChange={handleCategoryChange}
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Date Range
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CalendarIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                            </div>
                            <DatePicker
                                selected={localFilters.startFrom}
                                onChange={handleDateChange}
                                startDate={localFilters.startFrom}
                                endDate={localFilters.startTo}
                                selectsRange
                                className="form-input pl-10 w-full"
                                placeholderText="Select date range"
                                dateFormat="MMM d, yyyy"
                                isClearable
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-neutral-700 mb-1">
                            Tags
                        </label>
                        <form onSubmit={handleAddTag} className="flex space-x-2">
                            <div className="relative flex-grow rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <TagIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                                </div>
                                <input
                                    type="text"
                                    name="tags"
                                    id="tags"
                                    className="form-input pl-10"
                                    placeholder="Add tags"
                                    value={tagInput}
                                    onChange={handleTagInputChange}
                                />
                            </div>
                            <button type="submit" className="btn btn-outline px-3 py-2">
                                Add
                            </button>
                        </form>
                        {localFilters.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {localFilters.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-1 flex-shrink-0 text-primary-500 hover:text-primary-700"
                                        >
                                            <span className="sr-only">Remove tag</span>
                                            <XMarkIcon className="h-3 w-3" aria-hidden="true" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-4 border-t border-neutral-200 flex flex-col space-y-3">
                        <button
                            type="button"
                            onClick={applyFilters}
                            className="btn btn-primary"
                        >
                            Apply Filters
                        </button>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="btn btn-outline"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EventFilterSidebar;