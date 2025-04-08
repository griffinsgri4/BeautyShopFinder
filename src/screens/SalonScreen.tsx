import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, shadows, borderRadius } from '../theme';
import { StatusBar } from 'expo-status-bar';
import { SalonMapView } from '../components/MapView';
import { QueueManagement } from '../components/QueueManagement';
import { ShopQueue } from '../services/queueService';

type SalonShop = {
  id: string;
  name: string;
  distance: string;
  waitTime: string;
  rating: number;
  queueSize: number;
  isOpen: boolean;
  services: string[];
  specialties: string[];
};

const dummySalonShops: SalonShop[] = [
  {
    id: '1',
    name: 'Luxe Hair Studio',
    distance: '0.3 km',
    waitTime: '20 min',
    rating: 4.7,
    queueSize: 4,
    isOpen: true,
    services: ['Haircut', 'Hair Coloring', 'Hair Treatment'],
    specialties: ['Balayage', 'Brazilian Blowout'],
  },
  {
    id: '2',
    name: 'Chic & Style Salon',
    distance: '0.8 km',
    waitTime: '15 min',
    rating: 4.5,
    queueSize: 2,
    isOpen: true,
    services: ['Haircut', 'Hair Styling', 'Extensions'],
    specialties: ['Wedding Styling', 'Color Correction'],
  },
  {
    id: '3',
    name: 'Modern Cuts',
    distance: '1.5 km',
    waitTime: '25 min',
    rating: 4.3,
    queueSize: 3,
    isOpen: true,
    services: ['Haircut', 'Blow Dry', 'Hair Treatment'],
    specialties: ['Men\'s Styling', 'Kids Haircuts'],
  },
];

type SalonScreenProps = {
  navigation: any;
};

export const SalonScreen = ({ navigation }: SalonScreenProps) => {
  const [sortBy, setSortBy] = useState<'queue' | 'wait'>('queue');
  const [salons, setSalons] = useState(dummySalonShops);

  // Convert dummy data to include coordinates
  const salonShopsWithLocation = salons.map(shop => ({
    ...shop,
    // Adding mock coordinates - in real app, these would come from your backend
    latitude: 37.78825 + (Math.random() - 0.5) * 0.02,
    longitude: -122.4324 + (Math.random() - 0.5) * 0.02
  }));

  useEffect(() => {
    // Sort salons based on selected criteria
    const sortedSalons = [...dummySalonShops].sort((a, b) => {
      if (sortBy === 'queue') {
        return a.queueSize - b.queueSize;
      } else {
        // Parse wait time strings to minutes for comparison
        const aWaitMinutes = parseInt(a.waitTime);
        const bWaitMinutes = parseInt(b.waitTime);
        return aWaitMinutes - bWaitMinutes;
      }
    });
    setSalons(sortedSalons);
  }, [sortBy, salons]);

  const handleSalonSelect = (salon: any) => {
    setSelectedSalon(salon);
    console.log('Selected salon:', salon);
  };

  const [selectedSalon, setSelectedSalon] = useState<SalonShop | null>(null);

  const handleQueueUpdate = (shopId: string, queue: ShopQueue) => {
    // Update the queue information for the specific salon
    const updatedSalons = dummySalonShops.map(salon => {
      if (salon.id === shopId) {
        return {
          ...salon,
          queueSize: queue.currentQueueSize,
          waitTime: `${Math.ceil(queue.averageWaitTime)} min`
        };
      }
      return salon;
    });
    // In a real app, you would update this through proper state management
    console.log('Queue updated:', queue);
  };

  const renderSalonItem = ({ item }: { item: SalonShop }) => (
    <TouchableOpacity 
      style={styles.salonCard}
      onPress={() => navigation.navigate('ShopDetail', { shop: item })}
    >
      <View style={styles.salonHeader}>
        <Text style={styles.salonName}>{item.name}</Text>
        <View style={[styles.statusIndicator, { backgroundColor: item.isOpen ? '#2ecc71' : '#e74c3c' }]} />
      </View>
      <View style={styles.salonInfo}>
        <Text style={styles.infoText}>Distance: {item.distance}</Text>
        <Text style={styles.infoText}>Wait Time: {item.waitTime}</Text>
      </View>
      <View style={styles.salonDetails}>
        {selectedSalon?.id === item.id && (
          <QueueManagement
            shopId={item.id}
            onQueueUpdate={(queue) => handleQueueUpdate(item.id, queue)}
          />
        )}
        <View style={styles.queueInfo}>
          <Text style={styles.queueText}>Queue Size: {item.queueSize}</Text>
          <Text style={styles.ratingText}>★ {item.rating.toFixed(1)}</Text>
        </View>
        <View style={styles.servicesList}>
          {item.services.map((service, index) => (
            <View key={`service-${index}`} style={styles.serviceTag}>
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
        </View>
        <View style={styles.specialtiesList}>
          {item.specialties.map((specialty, index) => (
            <View key={`specialty-${index}`} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Salons</Text>
        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'queue' && styles.sortButtonActive]}
            onPress={() => setSortBy('queue')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'queue' && styles.sortButtonTextActive]}>Sort by Queue Size</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'wait' && styles.sortButtonActive]}
            onPress={() => setSortBy('wait')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'wait' && styles.sortButtonTextActive]}>Sort by Wait Time</Text>
          </TouchableOpacity>
        </View>
      </View>
      <SalonMapView
        salons={salonShopsWithLocation}
        onSalonSelect={handleSalonSelect}
      />
      <FlatList
        data={dummySalonShops}
        renderItem={renderSalonItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.salonsList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  sortButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral200,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
  },
  sortButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
  },
  sortButtonTextActive: {
    color: colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  salonsList: {
    padding: spacing.md,
    gap: spacing.md,
  },
  salonCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  salonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  salonName: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  statusIndicator: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: borderRadius.round,
  },
  salonInfo: {
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  salonDetails: {
    gap: spacing.sm,
  },
  queueInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  queueText: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
  },
  ratingText: {
    fontSize: typography.sizes.sm,
    color: colors.warning,
    fontWeight: '600',
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  serviceTag: {
    backgroundColor: colors.neutral200,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  serviceText: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  specialtyTag: {
    backgroundColor: colors.neutral200,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  specialtyText: {
    fontSize: typography.sizes.xs,
    color: colors.accent,
  },
});