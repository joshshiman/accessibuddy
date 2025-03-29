'use client';

import dynamic from 'next/dynamic';

// Dynamically import the map component with SSR disabled
const MapComponent = dynamic(
  () => import('./map-content'),
  { 
    ssr: false, // This will prevent the component from being rendered on the server
    loading: () => <div>Loading map...</div>
  }
);

export default MapComponent; 