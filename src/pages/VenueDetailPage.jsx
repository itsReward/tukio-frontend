import React from 'react';
import { Helmet } from 'react-helmet';
import VenueDetail from '../components/venues/VenueDetail';

const VenueDetailPage = () => {
  return (
    <>
      <Helmet>
        <title>Venue Details | Tukio</title>
        <meta name="description" content="View details about this venue including capacity, amenities, and upcoming events." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <VenueDetail />
      </div>
    </>
  );
};

export default VenueDetailPage;