import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { shopRecommendationService, ShopScore } from '../services/shopRecommendationService';
import { queueService } from '../services/queueService';
import { serviceAvailabilityService } from '../services/serviceAvailabilityService';
import { shopService, BeautyShop } from '../services/shopService';

export const ShopDiscoveryScreen = () => {
  const [shops, setShops] = useState<BeautyShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<ShopScore[]>([]);

  useEffect(() => {
    const updateShopData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch shops from Firebase
        const fetchedShops = await shopService.getAllShops();
        
        if (fetchedShops.length === 0) {
          setError('No shops available at the moment');
          return;
        }

        // Convert shops to ShopDetails format for recommendation service
        const shopDetails = fetchedShops.map(shop => ({
          id: shop.id,
          name: shop.name,
          distance: shop.distance,
          services: shop.services
        }));

        // Get shop scores and recommendations
        const scores = await shopRecommendationService.calculateShopScores(shopDetails);
        
        // Update shops with real-time data
        const updatedShops = await Promise.all(
          fetchedShops.map(async (shop) => {
            const queueData = await queueService.getQueueStatus(shop.id);
            const availabilityData = await serviceAvailabilityService.getServiceAvailability(shop.id);
            const shopScore = scores.find(score => score.shopId === shop.id);

            return {
              ...shop,
              queueSize: queueData?.currentQueueSize || 0,
              waitTime: queueData?.averageWaitTime || 0,
              isRecommended: shopScore?.isRecommended || false
            };
          })
        );

        // Sort shops by score
        const sortedShops = updatedShops.sort((a, b) => {
          const scoreA = scores.find(s => s.shopId === a.id)?.totalScore || 0;
          const scoreB = scores.find(s => s.shopId === b.id)?.totalScore || 0;
          return scoreB - scoreA;
        });

        setShops(sortedShops);

        // Get alternative recommendations if current shop has high wait time
        if (sortedShops.length > 0) {
          const alternatives = await shopRecommendationService.getAlternativeRecommendations(
            sortedShops[0].id,
            shopDetails
          );
          setAlternatives(alternatives);
        }
      } catch (error) {
        console.error('Error updating shop data:', error);
        setError('Unable to load shop data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    updateShopData();

    // Set up real-time updates
    const unsubscribeFromShops = shopService.subscribeToShops(() => {
      updateShopData();
    });

    const unsubscribeFromQueue = queueService.subscribeToQueueUpdates('all', () => {
      updateShopData();
    });

    return () => {
      unsubscribeFromShops();
      unsubscribeFromQueue();
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading shops...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderShopItem = ({ item }: { item: BeautyShop }) => (
    <View style={styles.shopCard}>
      <View style={styles.shopHeader}>
        <Text style={styles.shopName}>{item.name}</Text>
        <View style={[styles.statusIndicator, { backgroundColor: item.isOpen ? '#2ecc71' : '#e74c3c' }]} />
      </View>
      <View style={styles.shopInfo}>
        <Text style={styles.infoText}>Distance: {item.distance.toFixed(1)} km</Text>
        <Text style={styles.infoText}>Wait Time: {item.waitTime} min</Text>
        <Text style={styles.infoText}>Queue Size: {item.queueSize}</Text>
        <Text style={styles.infoText}>Rating: {item.rating.toFixed(1)}</Text>
        {item.isRecommended && (
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>Recommended</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <FlatList
        data={shops}
        renderItem={renderShopItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2c3e50'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center'
  },
  listContainer: {
    padding: 16
  },
  shopCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  shopInfo: {
    gap: 8
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d'
  },
  recommendedBadge: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8
  },
  recommendedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  }
});