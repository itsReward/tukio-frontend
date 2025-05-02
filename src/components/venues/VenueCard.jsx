import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPinIcon, UserGroupIcon, CheckIcon } from '@heroicons/react/24/outline';

const VenueCard = ({ venue }) => {
    // Default placeholder image if no image is provided
    const defaultImage = '/assets/images/venue-placeholder.jpg';

    return (
        <motion.div
            className="card overflow-hidden flex flex-col h-full"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
        >
            {/* Venue Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={venue.imageUrl || defaultImage}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                    <span className={`badge ${venue.availabilityStatus ? 'badge-success' : 'badge-accent'}`}>
                        {venue.availabilityStatus ? 'Available' : 'Unavailable'}
                    </span>
                </div>
            </div>

            {/* Venue Info */}
            <div className="flex-1 p-4 flex flex-col">
                <div className="mb-2">
                    <span className="badge badge-secondary text-xs">
                        {venue.type.replace('_', ' ')}
                    </span>
                </div>

                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    {venue.name}
                </h3>

                <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                    {venue.description || 'No description available'}
                </p>

                <div className="mt-auto space-y-2 text-sm text-neutral-600">
                    <div className="flex items-start">
                        <MapPinIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span className="line-clamp-1">{venue.location}</span>
                    </div>

                    <div className="flex items-start">
                        <UserGroupIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span>Capacity: {venue.capacity} people</span>
                    </div>

                    {venue.amenities && venue.amenities.length > 0 && (
                        <div className="flex items-start">
                            <div className="h-5 w-5 mr-2 flex-shrink-0 flex items-center justify-center">
                                <CheckIcon className="h-4 w-4 text-neutral-500" />
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {venue.amenities.slice(0, 2).map((amenity, index) => (
                                    <span key={index} className="text-xs text-neutral-500">
                                        {amenity}{index < Math.min(venue.amenities.length, 2) - 1 ? ', ' : ''}
                                    </span>
                                ))}
                                {venue.amenities.length > 2 && (
                                    <span className="text-xs text-neutral-500">+{venue.amenities.length - 2} more</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 border-t border-neutral-200">
                <Link
                    to={`/venues/${venue.id}`}
                    className="btn btn-primary w-full"
                >
                    View Details
                </Link>
            </div>
        </motion.div>
    );
};

export default VenueCard;