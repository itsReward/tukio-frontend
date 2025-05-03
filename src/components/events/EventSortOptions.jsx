import React from 'react';
import PropTypes from 'prop-types';
import {
    AdjustmentsHorizontalIcon,
    CalendarIcon,
    ArrowsUpDownIcon,
    FireIcon,
    HashtagIcon
} from '@heroicons/react/24/outline';

/**
 * Event Sort Options Component
 * Displays sort options for event listings
 */
const EventSortOptions = ({ sortOption, onSortChange }) => {
    // Sort options
    const sortOptions = [
        { value: 'date-asc', label: 'Date (Soonest)', icon: CalendarIcon },
        { value: 'date-desc', label: 'Date (Latest)', icon: CalendarIcon },
        { value: 'title-asc', label: 'Title (A-Z)', icon: HashtagIcon },
        { value: 'title-desc', label: 'Title (Z-A)', icon: HashtagIcon },
        { value: 'popularity', label: 'Popularity', icon: FireIcon }
    ];

    return (
        <div className="flex items-center space-x-2">
            <div className="relative flex-shrink-0">
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-neutral-500" />
            </div>
            <div className="relative">
                <label htmlFor="sort-select" className="sr-only">
                    Sort Events
                </label>
                <select
                    id="sort-select"
                    value={sortOption}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="form-select py-1 pl-2 pr-8 text-sm border-neutral-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                    {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                    <ArrowsUpDownIcon className="h-4 w-4" />
                </div>
            </div>
        </div>
    );
};

EventSortOptions.propTypes = {
    /** Current sort option */
    sortOption: PropTypes.string.isRequired,
    /** Sort change handler */
    onSortChange: PropTypes.func.isRequired
};

export default EventSortOptions;