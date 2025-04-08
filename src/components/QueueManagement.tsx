import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { queueService, QueueEntry, ShopQueue } from '../services/queueService';
import { serviceAvailabilityService, ServiceStatus, ShopServiceAvailability } from '../services/serviceAvailabilityService';
import { colors, spacing, typography, borderRadius } from '../theme';

interface QueueManagementProps {
  shopId: string;
  onQueueUpdate?: (queue: ShopQueue) => void;
  selectedServiceId?: string;
}

export const QueueManagement: React.FC<QueueManagementProps> = ({ shopId, onQueueUpdate, selectedServiceId }) => {
  const [queue, setQueue] = useState<ShopQueue | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [serviceAvailability, setServiceAvailability] = useState<ShopServiceAvailability | null>(null);

  useEffect(() => {
    const queueUnsubscribe = queueService.subscribeToQueueUpdates(shopId, (updatedQueue) => {
      setQueue(updatedQueue);
      onQueueUpdate?.(updatedQueue);
    });

    const availabilityUnsubscribe = serviceAvailabilityService.subscribeToServiceAvailability(
      shopId,
      (availability) => setServiceAvailability(availability)
    );

    return () => {
      queueUnsubscribe();
      availabilityUnsubscribe();
    };
  }, [shopId]);

  const handleJoinQueue = async () => {
    try {
      setIsJoining(true);
      // In a real app, you would get the actual userId from authentication
      const userId = 'temp-user-id';
      await queueService.addToQueue(shopId, {
        userId,
        serviceId: selectedServiceId || 'default-service',
      });
    } catch (error) {
      console.error('Error joining queue:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const getStatusColor = (size: number) => {
    if (size <= 2) return colors.success;
    if (size <= 5) return colors.warning;
    return colors.error;
  };

  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getServiceStatusColor = (service: ServiceStatus) => {
    if (!service.isAvailable) return colors.error;
    if (service.currentCapacity >= service.maxCapacity) return colors.warning;
    return colors.success;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.queueInfo}>
          <View style={styles.statusContainer}>
            <Text style={styles.label}>Current Queue</Text>
            <View
              style={[styles.queueSize, { backgroundColor: getStatusColor(queue?.currentQueueSize || 0) }]}
            >
              <Text style={styles.queueSizeText}>{queue?.currentQueueSize || 0}</Text>
            </View>
          </View>

        <View style={styles.waitTimeContainer}>
          <Text style={styles.label}>Estimated Wait</Text>
          <Text style={styles.waitTime}>
            {formatWaitTime(queue?.averageWaitTime || 15)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.joinButton, isJoining && styles.joiningButton]}
        onPress={handleJoinQueue}
        disabled={isJoining}
      >
        <Text style={styles.joinButtonText}>
          {isJoining ? 'Joining Queue...' : 'Join Queue'}
        </Text>
      </TouchableOpacity>

        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>Service Availability</Text>
          {serviceAvailability && Object.values(serviceAvailability.services).map((service) => (
            <View key={service.id} style={styles.serviceItem}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDetails}>
                  Capacity: {service.currentCapacity}/{service.maxCapacity}
                </Text>
              </View>
              <View
                style={[styles.serviceStatus, { backgroundColor: getServiceStatusColor(service) }]}
              >
                <Text style={styles.serviceStatusText}>
                  {service.isAvailable ? 'Available' : 'Unavailable'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.lastUpdated}>
          Last updated: {queue ? new Date(queue.lastUpdated).toLocaleTimeString() : '-'}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  servicesContainer: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    ...typography.subtitle1,
    marginBottom: spacing.xs,
  },
  serviceDetails: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  serviceStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  serviceStatusText: {
    ...typography.caption,
    color: colors.white,
  },
  container: {
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  queueInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statusContainer: {
    alignItems: 'center',
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  queueSize: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  queueSizeText: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  waitTimeContainer: {
    alignItems: 'center',
  },
  waitTime: {
    fontSize: typography.sizes.lg,
    color: colors.text,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  joiningButton: {
    backgroundColor: colors.primaryLight,
  },
  joinButtonText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  lastUpdated: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});