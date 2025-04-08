import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, shadows, borderRadius } from '../theme';
import { StatusBar } from 'expo-status-bar';
import { SalonMapView } from '../components/MapView';

type BarberShop = {
  id: string;
  name: string;
  distance: string;
  waitTime: string;
  rating: number;
  reviews: number;
  services: string[];
  specialties: string[];
  isOpen: boolean;
};

const dummyBarberShops: BarberShop[] = [
  {
    id: '1',
    name: 'Classic Cuts Barbershop',
    distance: '0.5 miles',
    waitTime: '15 mins',
    rating: 4.8,
    reviews: 120,
    services: ['Haircut', 'Beard Trim', 'Hot Towel Shave'],
    specialties: ['Fade Specialist', 'Traditional Barbering'],
    isOpen: true
  },
  {
    id: '2',
    name: "Modern Man's Grooming",
    distance: '0.8 miles',
    waitTime: '30 mins',
    rating: 4.6,
    reviews: 85,
    services: ['Haircut', 'Beard Grooming', 'Hair Styling'],
    specialties: ['Modern Styles', 'Precision Cuts'],
    isOpen: true
  }
];

type BarberShopScreenProps = {
  navigation: any;
};

export const BarberShopScreen = ({ navigation }: BarberShopScreenProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView>
        <View style={styles.mapContainer}>
          <SalonMapView salons={[]} />
        </View>
        
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Nearby Barbershops</Text>
          <View style={styles.shopList}>
            {dummyBarberShops.map((shop) => (
              <TouchableOpacity
                key={shop.id}
                style={styles.shopCard}
                onPress={() => navigation.navigate('ShopDetail', { shop })}
              >
                <Text style={styles.shopName}>{shop.name}</Text>
                <Text style={styles.shopDetails}>⭐ {shop.rating.toFixed(1)} ({shop.reviews} reviews)</Text>
                <Text style={styles.shopDetails}>📍 {shop.distance}</Text>
                <Text style={styles.shopDetails}>⏰ Wait time: {shop.waitTime}</Text>
                <View style={styles.servicesList}>
                  {shop.services.map((service, index) => (
                    <View key={`service-${index}`} style={styles.serviceTag}>
                      <Text style={styles.serviceText}>{service}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    height: 300,
    width: '100%',
    backgroundColor: colors.neutral200,
  },
  content: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },
  shopList: {
    gap: spacing.md,
  },
  shopCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  shopName: {
    fontSize: typography.sizes.lg,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  shopDetails: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  serviceTag: {
    backgroundColor: colors.neutral200,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  serviceText: {
    fontSize: typography.sizes.xs,
    color: colors.text,
  },
});