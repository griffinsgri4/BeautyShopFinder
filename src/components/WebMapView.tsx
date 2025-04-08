import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { GoogleMap, Marker, InfoWindow, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import { GoogleMapsWrapper } from './GoogleMapsWrapper';

type Salon = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: string;
  rating: number;
  services: string[];
  isOpen: boolean;
  waitTime?: string;
  queueSize?: number;
  specialties?: string[];
};

type WebMapViewProps = {
  salons: Salon[];
  onSalonSelect?: (salon: Salon) => void;
  userLocation?: { latitude: number; longitude: number };
};

type DirectionsInfo = {
  distance: string;
  duration: string;
  steps: Array<{
    instructions: string;
    distance: string;
    duration: string;
  }>;
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

export const WebMapView: React.FC<WebMapViewProps> = ({ salons, onSalonSelect, userLocation }) => {
  const [selectedSalon, setSelectedSalon] = React.useState<Salon | null>(null);
  const [directions, setDirections] = React.useState<DirectionsInfo | null>(null);
  const [directionsResponse, setDirectionsResponse] = React.useState<google.maps.DirectionsResult | null>(null);

  const center = userLocation
    ? { lat: userLocation.latitude, lng: userLocation.longitude }
    : defaultCenter;

  const calculateRoute = React.useCallback((salon: Salon) => {
    if (!userLocation) return;

    const origin = { lat: userLocation.latitude, lng: userLocation.longitude };
    const destination = { lat: salon.latitude, lng: salon.longitude };

    return (
      <DirectionsService
        options={{
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        }}
        callback={(response) => {
          if (response !== null) {
            setDirectionsResponse(response);
            const route = response.routes[0];
            if (route) {
              setDirections({
                distance: route.legs[0].distance?.text || '',
                duration: route.legs[0].duration?.text || '',
                steps: route.legs[0].steps.map(step => ({
                  instructions: step.instructions,
                  distance: step.distance?.text || '',
                  duration: step.duration?.text || ''
                }))
              });
            }
          }
        }}
      />
    );
  }, [userLocation]);

  return (
    <View style={styles.container}>
      <GoogleMapsWrapper>
        <GoogleMap
          mapContainerStyle={styles.map}
          center={center}
          zoom={14}
        >
        {/* User's location marker */}
        {userLocation && (
          <Marker
            position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
            title="You are here"
            icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
          />
        )}

        {/* Salon markers */}
        {salons.map((salon) => (
          <Marker
            key={salon.id}
            position={{ lat: salon.latitude, lng: salon.longitude }}
            onClick={() => {
              setSelectedSalon(salon);
              onSalonSelect && onSalonSelect(salon);
            }}
          >
            {selectedSalon?.id === salon.id && (
              <InfoWindow
                onCloseClick={() => setSelectedSalon(null)}
              >
                <div>
                  <h3>{salon.name}</h3>
                  <p>Distance: {salon.distance}</p>
                  <p>Rating: {salon.rating} ★</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
        {selectedSalon && calculateRoute(selectedSalon)}
        {directionsResponse && (
          <DirectionsRenderer
            options={{
              directions: directionsResponse,
              suppressMarkers: false,
            }}
          />
        )}
      </GoogleMap>
      </GoogleMapsWrapper>
      {directions && (
        <ScrollView style={styles.directionsPanel}>
          <Text style={styles.directionsHeader}>
            Distance: {directions.distance} | ETA: {directions.duration}
          </Text>
          {directions.steps.map((step, index) => (
            <View key={index} style={styles.directionStep}>
              <Text style={styles.stepInstruction}
                dangerouslySetInnerHTML={{ __html: step.instructions }}
              />
              <Text style={styles.stepDetails}>
                {step.distance} ({step.duration})
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 500,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '60%',
  },
  directionsPanel: {
    width: '100%',
    height: '40%',
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  directionsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  directionStep: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  stepInstruction: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  stepDetails: {
    fontSize: 12,
    color: '#666',
  },
});