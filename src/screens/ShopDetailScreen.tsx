import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { colors, spacing, typography, shadows, borderRadius } from '../theme';
import { StatusBar } from 'expo-status-bar';
import { QueueManagement } from '../components/QueueManagement';
import { BookingModal } from '../components/BookingModal';
import { appointmentService } from '../services/appointmentService';
import type { ShopQueue } from '../services/queueService';

type ShopDetailScreenProps = {
  route: {
    params: {
      shop: {
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
    };
  };
  navigation: any;
};

const serviceDetails = {
  'Haircut': { price: 'KSH 50', duration: '30 min', description: 'Professional haircut tailored to your style' },
  'Hair Coloring': { price: 'KSH 150', duration: '120 min', description: 'Full hair coloring service with premium products' },
  'Hair Treatment': { price: 'KSH 80', duration: '60 min', description: 'Deep conditioning and repair treatment' },
  'Hair Styling': { price: 'KSH 60', duration: '45 min', description: 'Professional styling for any occasion' },
  'Extensions': { price: 'KSH 200', duration: '180 min', description: 'Premium hair extension installation' },
  'Blow Dry': { price: 'KSH 40', duration: '30 min', description: 'Professional blow dry and styling' },
};

const shopImages = [
  require('../../assets/salon-background.svg'),
  // Add more shop images here
];

export const ShopDetailScreen: React.FC<ShopDetailScreenProps> = ({ route, navigation }) => {
  const { shop } = route.params;

  const handleQueueUpdate = (queue: ShopQueue) => {
    console.log('Queue updated:', queue);
  };

  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);

  const handleBooking = () => {
    setIsBookingModalVisible(true);
  };

  const handleBookingConfirm = async (booking: {
    service: string;
    date: string;
    time: string;
    price: string;
    duration: string;
  }) => {
    try {
      await appointmentService.createAppointment({
        shopId: shop.id,
        userId: 'current-user-id', // Replace with actual user ID from auth
        ...booking
      });
      setIsBookingModalVisible(false);
    } catch (error) {
      console.error('Failed to create appointment:', error);
    }
  };

  const services = shop.services.map(service => ({
    name: service,
    ...serviceDetails[service]
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{shop.name}</Text>
        </View>

        <ScrollView horizontal style={styles.imageGallery}>
          {shopImages.map((image, index) => (
            <Image key={index} source={image} style={styles.shopImage} />
          ))}
        </ScrollView>

        <View style={styles.infoSection}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: shop.isOpen ? colors.success : colors.error }]} />
            <Text style={styles.statusText}>{shop.isOpen ? 'Open' : 'Closed'}</Text>
          </View>
          <Text style={styles.infoText}>Distance: {shop.distance}</Text>
          <Text style={styles.infoText}>Wait Time: {shop.waitTime}</Text>
          <Text style={styles.ratingText}>★ {shop.rating.toFixed(1)}</Text>
        </View>

        <View style={styles.queueSection}>
          <Text style={styles.sectionTitle}>Queue Management</Text>
          <QueueManagement
            shopId={shop.id}
            onQueueUpdate={handleQueueUpdate}
          />
        </View>

        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Services</Text>
          {shop.services.map((service, index) => (
            <View key={index} style={styles.serviceCard}>
              <Text style={styles.serviceName}>{service}</Text>
              <Text style={styles.serviceDescription}>{serviceDetails[service]?.description}</Text>
              <View style={styles.serviceDetails}>
                <Text style={styles.servicePrice}>{serviceDetails[service]?.price}</Text>
                <Text style={styles.serviceDuration}>{serviceDetails[service]?.duration}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.specialtiesSection}>
          <Text style={styles.sectionTitle}>Specialties</Text>
          <View style={styles.specialtiesList}>
            {shop.specialties.map((specialty, index) => (
              <View key={index} style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </ScrollView>

      <BookingModal
        visible={isBookingModalVisible}
        onClose={() => setIsBookingModalVisible(false)}
        onConfirm={handleBookingConfirm}
        services={services}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.md,
  },
  backButtonText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  imageGallery: {
    height: 200,
    marginVertical: spacing.md,
  },
  shopImage: {
    width: 300,
    height: 200,
    marginHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  infoSection: {
    padding: spacing.md,
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusIndicator: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: borderRadius.round,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
  },
  infoText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  ratingText: {
    fontSize: typography.sizes.lg,
    color: colors.warning,
    fontWeight: '600',
  },
  queueSection: {
    padding: spacing.md,
    marginTop: spacing.md,
  },
  servicesSection: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  serviceCard: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  serviceName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  serviceDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.success,
  },
  serviceDuration: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
  },
  specialtiesSection: {
    padding: spacing.md,
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
  bookButton: {
    backgroundColor: colors.primary,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  bookButtonText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
});