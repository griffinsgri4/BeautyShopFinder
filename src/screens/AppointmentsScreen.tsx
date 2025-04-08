import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { appointmentService, Appointment } from '../services/appointmentService';





export const AppointmentsScreen = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const userId = 'current-user-id'; // Replace with actual user ID from auth
    const unsubscribe = appointmentService.subscribeToUserAppointments(
      userId,
      setAppointments
    );
    return () => unsubscribe();
  }, []);
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'upcoming':
        return '#2ecc71';
      case 'completed':
        return '#3498db';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#333';
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await appointmentService.cancelAppointment(appointmentId);
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
    }
  };

  const renderAppointmentItem = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.serviceName}>{item.service}</Text>
        <Text
          style={[styles.status, { color: getStatusColor(item.status) }]}
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
      <View style={styles.appointmentDetails}>
        <Text style={styles.dateTime}>{item.date} at {item.time}</Text>
        <Text style={styles.serviceInfo}>{item.duration} • {item.price}</Text>
        {item.status === 'upcoming' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelAppointment(item.id)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>My Appointments</Text>
      </View>
      <FlatList
        data={appointments}
        renderItem={renderAppointmentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.appointmentsList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  appointmentsList: {
    padding: 16,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  appointmentDetails: {
    marginTop: 8,
  },
  dateTime: {
    fontSize: 16,
    color: '#666',
  },
  serviceInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});