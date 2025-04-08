import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

type Service = {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
};

const dummyServices: Service[] = [
  {
    id: '1',
    name: 'Classic Facial',
    description: 'Deep cleansing facial treatment with steam and extraction',
    price: 'KSH 80',
    duration: '60 min',
  },
  {
    id: '2',
    name: 'Swedish Massage',
    description: 'Relaxing full body massage with essential oils',
    price: 'KSH 100',
    duration: '90 min',
  },
  {
    id: '3',
    name: 'Manicure & Pedicure',
    description: 'Complete nail care treatment for hands and feet',
    price: 'KSH 65',
    duration: '75 min',
  },
];

export const ServicesScreen = () => {
  const renderServiceItem = ({ item }: { item: Service }) => (
    <View style={styles.serviceCard}>
      <Text style={styles.serviceName}>{item.name}</Text>
      <Text style={styles.serviceDescription}>{item.description}</Text>
      <View style={styles.serviceDetails}>
        <Text style={styles.servicePrice}>{item.price}</Text>
        <Text style={styles.serviceDuration}>{item.duration}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>Our Services</Text>
      </View>
      <FlatList
        data={dummyServices}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.servicesList}
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
  servicesList: {
    padding: 16,
  },
  serviceCard: {
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
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2ecc71',
  },
  serviceDuration: {
    fontSize: 14,
    color: '#999',
  },
});