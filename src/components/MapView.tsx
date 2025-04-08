import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import * as Location from 'expo-location';
import { WebMapView } from './WebMapView';

// Only import react-native-maps on native platforms
let NativeMapView: any;
let NativeMarker: any;
let NativeCallout: any;
let NATIVE_PROVIDER_GOOGLE: any;

if (Platform.OS !== 'web') {
  const NativeMaps = require('react-native-maps');
  NativeMapView = NativeMaps.default;
  NativeMarker = NativeMaps.Marker;
  NativeCallout = NativeMaps.Callout;
  NATIVE_PROVIDER_GOOGLE = NativeMaps.PROVIDER_GOOGLE;
}

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

type MapViewProps = {
  salons: Salon[];
  onSalonSelect?: (salon: Salon) => void;
};

export const SalonMapView: React.FC<MapViewProps> = ({ salons, onSalonSelect }) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <Text>Loading location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <WebMapView
          salons={salons}
          onSalonSelect={onSalonSelect}
          userLocation={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          }}
        />
      ) : (
        <NativeMapView
          provider={NATIVE_PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* User's current location marker */}
        <NativeMarker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="You are here"
          pinColor="blue"
        />

        {/* Salon markers */}
        {salons.map((salon) => (
          <NativeMarker
            key={salon.id}
            coordinate={{
              latitude: salon.latitude,
              longitude: salon.longitude,
            }}
            onPress={() => onSalonSelect && onSalonSelect(salon)}
          >
            <NativeCallout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{salon.name}</Text>
                <Text>Distance: {salon.distance}</Text>
                <Text>Rating: {salon.rating} ★</Text>
              </View>
            </NativeCallout>
          </NativeMarker>
        ))}
      </NativeMapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    color: 'red',
  },
  callout: {
    padding: 10,
    width: 150,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});