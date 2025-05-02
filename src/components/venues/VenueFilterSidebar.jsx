import React, { useState } from 'react';
import {
    MagnifyingGlassIcon,
    UsersIcon,
    BuildingOffice2Icon,
    MapPinIcon,
    CheckIcon,
    AdjustmentsHorizontalIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const VenueFilterSidebar = ({ filters, venueTypes, commonAmenities, onFilterChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);
    const [customAmenity, setCustomAmenity] = useState('');

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters({
            ...localFilters,
            [name]: value
        });
    };

    // Handle capacity change
    const handleCapacityChange = (e) => {
        const value = e.target.value ? Number(e.target.value) : null;
        setLocalFilters({
            ...localFilters,
            minCapacity: value
        });
    };

    // Handle venue type change
    const handleVenueTypeChange = (e) => {
        setLocalFilters({
            ...localFilters,
            venueType: e.target.value
        });
    };

    // Handle amenity toggle
    const handleAmenityToggle = (amenity) => {
        const updatedAmenities = localFilters.amenities.includes(amenity)
            ? localFilters.amenities.filter(a => a !== amenity)
            : [...localFilters.amenities, amenity];

        setLocalFilters({
            ...localFilters,
            amenities: updatedAmenities
        });
    };

    // Handle custom amenity addition
    const handleAddCustomAmenity = (e) => {
        e.preventDefault();
        if (customAmenity.trim() && !localFilters.amenities.includes(customAmenity.trim())) {
            setLocalFilters({
                ...localFilters,
                amenities: [...localFilters.amenities, customAmenity.trim()]
            });
            setCustomAmenity('');
        }
    };

    // Apply filters
    const applyFilters = () => {
        onFilterChange(localFilters);
    };

    // Clear all filters
    const clearFilters = () => {
        const resetFilters = {
            keyword: '',
            minCapacity: null,
            venueType: '',
            amenities: [],
            location: '',
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
                    <h2 className="text-lg font-semibold text-neutral-900">Filter Venues</h2>
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
                                placeholder="Search venues"
                                value={localFilters.keyword}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Minimum Capacity */}
                    <div>
                        <label htmlFor="minCapacity" className="block text-sm font-medium text-neutral-700 mb-1">
                            Minimum Capacity
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UsersIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                            </div>
                            <input
                                type="number"
                                name="minCapacity"
                                id="minCapacity"
                                className="form-input pl-10"
                                placeholder="Minimum people"
                                min="1"
                                value={localFilters.minCapacity || ''}
                                onChange={handleCapacityChange}
                            />
                        </div>
                    </div>

                    {/* Venue Type */}
                    <div>
                        <label htmlFor="venueType" className="block text-sm font-medium text-neutral-700 mb-1">
                            Venue Type
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <BuildingOffice2Icon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                            </div>
                            <select
                                id="venueType"
                                name="venueType"
                                className="form-select pl-10"
                                value={localFilters.venueType}
                                onChange={handleVenueTypeChange}
                            >
                                <option value="">All Venue Types</option>
                                {venueTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-1">
                            Location
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPinIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                            </div>
                            <input
                                type="text"
                                name="location"
                                id="location"
                                className="form-input pl-10"
                                placeholder="Building or area"
                                value={localFilters.location}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Amenities */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-3">
                            Amenities
                        </label>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                            {commonAmenities.map((amenity) => (
                                <div key={amenity} className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => handleAmenityToggle(amenity)}
                                        className={`w-5 h-5 rounded flex items-center justify-center mr-2 border ${
                                            localFilters.amenities.includes(amenity)
                                                ? 'bg-primary-500 border-primary-500 text-white'
                                                : 'border-neutral-300 bg-white'
                                        }`}
                                    >
                                        {localFilters.amenities.includes(amenity) && (
                                            <CheckIcon className="h-3 w-3" />
                                        )}
                                    </button>
                                    <span className="text-sm text-neutral-700">{amenity}</span>
                                </div>
                            ))}
                        </div>

                        {/* Custom Amenity */}
                        <form onSubmit={handleAddCustomAmenity} className="mt-3 flex space-x-2">
                            <input
                                type="text"
                                placeholder="Add custom amenity"
                                className="form-input text-sm flex-grow"
                                value={customAmenity}
                                onChange={(e) => setCustomAmenity(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="btn btn-outline px-3 py-1 text-sm"
                            >
                                Add
                            </button>
                        </form>

                        {/* Selected Custom Amenities */}
                        {localFilters.amenities.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {localFilters.amenities
                                    .filter(amenity => !commonAmenities.includes(amenity))
                                    .map((amenity, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700"
                                        >
                                            {amenity}
                                            <button
                                                type="button"
                                                onClick={() => handleAmenityToggle(amenity)}
                                                className="ml-1 flex-shrink-0 text-primary-500 hover:text-primary-700"
                                            >
                                                <span className="sr-only">Remove amenity</span>
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

export default VenueFilterSidebar;