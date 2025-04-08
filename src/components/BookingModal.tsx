import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, typography, shadows, borderRadius } from '../theme';

type BookingModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (booking: {
    service: string;
    date: string;
    time: string;
    price: string;
    duration: string;
  }) => void;
  services: Array<{
    name: string;
    price: string;
    duration: string;
    description: string;
  }>;
};

export const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  onClose,
  onConfirm,
  services
}) => {
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Generate available dates (next 7 days)
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  // Generate available time slots (9 AM to 5 PM, 1-hour intervals)
  const availableTimes = Array.from({ length: 9 }, (_, i) => {
    const hour = i + 9;
    return `${hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
  });

  const handleConfirm = () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    const service = services.find(s => s.name === selectedService);
    if (!service) return;

    onConfirm({
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      price: service.price,
      duration: service.duration
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Book Appointment</Text>
          
          <ScrollView style={styles.scrollView}>
            <Text style={styles.sectionTitle}>Select Service</Text>
            <View style={styles.servicesList}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.name}
                  style={[
                    styles.serviceItem,
                    selectedService === service.name && styles.selectedItem
                  ]}
                  onPress={() => setSelectedService(service.name)}
                >
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDetails}>
                    {service.price} • {service.duration}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Select Date</Text>
            <ScrollView horizontal style={styles.datesList}>
              {availableDates.map((date) => (
                <TouchableOpacity
                  key={date}
                  style={[
                    styles.dateItem,
                    selectedDate === date && styles.selectedItem
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text style={styles.dateText}>{new Date(date).toLocaleDateString()}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Select Time</Text>
            <View style={styles.timesList}>
              {availableTimes.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeItem,
                    selectedTime === time && styles.selectedItem
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={styles.timeText}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!selectedService || !selectedDate || !selectedTime) && styles.disabledButton
              ]}
              onPress={handleConfirm}
              disabled={!selectedService || !selectedDate || !selectedTime}
            >
              <Text style={styles.confirmButtonText}>Confirm Booking</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    height: '80%'
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center'
  },
  scrollView: {
    flex: 1
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm
  },
  servicesList: {
    gap: spacing.sm
  },
  serviceItem: {
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    ...shadows.sm
  },
  serviceName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text
  },
  serviceDetails: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    marginTop: spacing.xs
  },
  datesList: {
    flexDirection: 'row',
    marginBottom: spacing.md
  },
  dateItem: {
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    minWidth: 100,
    alignItems: 'center'
  },
  dateText: {
    fontSize: typography.sizes.sm,
    color: colors.text
  },
  timesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  timeItem: {
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    minWidth: 80,
    alignItems: 'center'
  },
  timeText: {
    fontSize: typography.sizes.sm,
    color: colors.text
  },
  selectedItem: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.md
  },
  cancelButton: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.neutral300,
    borderRadius: borderRadius.md,
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text
  },
  confirmButton: {
    flex: 2,
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center'
  },
  confirmButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.neutral100
  },
  disabledButton: {
    backgroundColor: colors.neutral400,
    opacity: 0.5
  }
});