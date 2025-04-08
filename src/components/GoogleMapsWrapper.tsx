import React from 'react';
import { LoadScript } from '@react-google-maps/api';
import { env } from '../config/env';

type GoogleMapsWrapperProps = {
  children: React.ReactNode;
};

export const GoogleMapsWrapper: React.FC<GoogleMapsWrapperProps> = ({ children }) => {
  return (
    <LoadScript
      googleMapsApiKey={env.googleMapsApiKey}
      loadingElement={<div>Loading...</div>}
    >
      {children}
    </LoadScript>
  );
};