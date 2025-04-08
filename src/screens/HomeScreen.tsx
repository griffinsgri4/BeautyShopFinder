import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Dimensions, Animated, TouchableWithoutFeedback, Modal, TextInput, ActivityIndicator, GestureResponderEvent, FlatList, ImageBackground, Image } from 'react-native';
import { SalonMapView } from '../components/MapView';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { auth } from '../config/firebase';
import { User } from 'firebase/auth';

import { Salon } from '../types';

export const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Salon[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileImageError, setProfileImageError] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Reset profile image error state when user changes
        setProfileImageError(false);
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const dummyShops: Salon[] = [
    {
      id: '1',
      name: 'Glamour Beauty Salon',
      latitude: 37.7749,
      longitude: -122.4194,
      distance: '0.5 km',
      rating: 4.5,
      isOpen: true,
      services: ['Haircut', 'Hair Coloring', 'Facial']
    },
    {
      id: '2',
      name: 'Style Studio',
      latitude: 37.7848,
      longitude: -122.4294,
      distance: '1.2 km',
      rating: 4.8,
      isOpen: true,
      services: ['Hair Coloring', 'Makeup', 'Spa Treatment']
    },
    {
      id: '3',
      name: 'Elite Cuts',
      latitude: 37.7947,
      longitude: -122.4394,
      distance: '2.0 km',
      rating: 4.2,
      isOpen: true,
      services: ['Haircut', 'Beard Trim', 'Hair Coloring']
    }
  ];

  const searchNearbyShops = async () => {
    if (!userLocation) return;
    
    setIsLoading(true);
    try {
      // Simulate API call with dummy data for now
      const nearbyShops = dummyShops.map(shop => ({
        ...shop,
        distance: `${(Math.random() * 5).toFixed(1)} km`
      }));
      
      const filteredShops = nearbyShops.filter(shop =>
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.services.some(service =>
          service.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );

      setSearchResults(filteredShops);
    } catch (error) {
      console.error('Error searching shops:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchModalVisible && userLocation) {
      searchNearbyShops();
    }
  }, [searchModalVisible, searchQuery]);

  const handleShopSelect = (shop: Salon) => {
    setSearchModalVisible(false);
    navigation.navigate('Salon', { shopId: shop.id });
  };

  const renderSearchModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={searchModalVisible}
      onRequestClose={() => setSearchModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setSearchModalVisible(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Nearby Shops</Text>
          <View style={{ width: 24 }} />
        </View>

        <SalonMapView
          salons={searchResults}
          onSalonSelect={handleShopSelect}
        />

        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.shopItem}
              onPress={() => handleShopSelect(item)}
            >
              <View style={styles.shopInfo}>
                <Text style={styles.shopName}>{item.name}</Text>
                <Text style={styles.shopDistance}>{item.distance}</Text>
              </View>
              <View style={styles.shopServices}>
                {item.services.map((service, index) => (
                  <View key={index} style={styles.serviceTag}>
                    <Text style={styles.serviceText}>{service}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          )}
          style={styles.shopList}
        />
      </SafeAreaView>
    </Modal>
  );
  const menuAnimation = useRef(new Animated.Value(0)).current;
  const backdropAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
    })();
  }, []);

  const toggleMenu = (shouldOpenOrEvent: boolean | GestureResponderEvent
     = !menuExpanded) => {
    const shouldOpen = typeof shouldOpenOrEvent === 'boolean' ? shouldOpenOrEvent : !menuExpanded;
    const toValue = shouldOpen ? 1 : 0;
    Animated.parallel([
      Animated.timing(menuAnimation, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(backdropAnimation, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
    setMenuExpanded(shouldOpen);
  };

  const handleMenuItemPress = (screenName: keyof RootStackParamList) => {
    toggleMenu(false);
    navigation.navigate(screenName as any);
  };

  const menuWidth = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-250, 0],
  });

  const backdropOpacity = backdropAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const handleServicePress = (service: string) => {
    if (!userLocation) {
      // Request location permission if not granted
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
      })();
      return;
    }

    // Filter shops by selected service
    const filteredShops = dummyShops.filter(shop =>
      shop.services.some(s => s.toLowerCase() === service.toLowerCase())
    );

    // Update search results with filtered shops
    setSearchResults(filteredShops);
    setSearchModalVisible(true);
  };

  const handleSalonPress = () => {
    navigation.navigate('Salon', { shopId: 'default' });
  };

  const handleBarberShopPress = () => {
    navigation.navigate('Barbershop');
  };

  const renderShopCategory = (title: string, icon: string) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => {
        if (title === 'Salon') {
          handleSalonPress();
        } else if (title === 'Barbershop') {
          handleBarberShopPress();
        }
      }}
    >
      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={32} color="#333" />
      <Text style={styles.categoryTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../../assets/salon-background.svg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
      {menuExpanded && (
        <TouchableWithoutFeedback onPress={() => toggleMenu(false)}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </TouchableWithoutFeedback>
      )}
      <Animated.View style={[styles.menu, { transform: [{ translateX: menuWidth }] }]}>
        <View style={styles.menuHeader}>
          <View style={styles.profileSection}>
            <View style={styles.profilePicture}>
              {currentUser?.photoURL && !profileImageError ? (
                <Image
                  source={{ uri: currentUser.photoURL }}
                  style={styles.profileImage}
                  onError={() => setProfileImageError(true)}
                />
              ) : (
                <View style={styles.defaultAvatarContainer}>
                  <Ionicons
                    name={currentUser?.email?.toLowerCase().includes('female') ? 'woman' : 'person'}
                    size={40}
                    color="#666"
                  />
                </View>
              )}
            </View>
            <Text style={styles.profileName}>
              {currentUser?.displayName || 'Guest User'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleMenuItemPress('Profile')}
        >
          <Ionicons name="person-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleMenuItemPress('Appointments')}
        >
          <Ionicons name="calendar-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Appointments</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleMenuItemPress('Services')}
        >
          <Ionicons name="cut-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Services</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleMenuItemPress('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>
      </Animated.View>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <TouchableOpacity onPress={toggleMenu}>
              <Ionicons name="menu-outline" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Beauty Shop Finder</Text>
            <TouchableOpacity onPress={() => setSearchModalVisible(true)}>
              <Ionicons name="search-outline" size={24} color="#333" />
            </TouchableOpacity>
            
            <Modal
              animationType="slide"
              transparent={true}
              visible={searchModalVisible}
              onRequestClose={() => setSearchModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.searchHeader}>
                    <TouchableOpacity onPress={() => setSearchModalVisible(false)}>
                      <Ionicons name="close-outline" size={24} color="#333" />
                    </TouchableOpacity>
                    <View style={styles.searchInputContainer}>
                      <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search nearby shops..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                      />
                    </View>
                  </View>
                  
                  {isLoading ? (
                    <ActivityIndicator size="large" color="#2ecc71" style={styles.loader} />
                  ) : (
                    <ScrollView style={styles.searchResults}>
                      {searchResults.length > 0 ? (
                        searchResults.map((shop) => (
                          <TouchableOpacity
                            key={shop.id}
                            style={styles.searchResultItem}
                            onPress={() => handleShopSelect(shop.id)}
                          >
                            <View style={styles.shopInfo}>
                              <Text style={styles.shopName}>{shop.name}</Text>
                              <View style={styles.shopMetaInfo}>
                                <Text style={styles.distanceText}>{shop.distance}</Text>
                                <Text style={styles.ratingText}>★ {shop.rating.toFixed(1)}</Text>
                                <View
                                  style={[styles.statusDot, { backgroundColor: shop.isOpen ? '#2ecc71' : '#e74c3c' }]}
                                />
                              </View>
                            </View>
                            <View style={styles.serviceTagsContainer}>
                              {shop.services.slice(0, 3).map((service, index) => (
                                <View key={index} style={styles.serviceTag}>
                                  <Text style={styles.serviceText}>{service}</Text>
                                </View>
                              ))}
                            </View>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <Text style={styles.noResults}>
                          {searchQuery ? 'No shops found matching your search' : 'Searching for shops near you...'}
                        </Text>
                      )}
                    </ScrollView>
                  )}
                </View>
              </View>
            </Modal>
          </View>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Featured Services</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScrollView}>
            <View style={styles.featuredContainer}>
              <TouchableOpacity style={styles.featuredCard} onPress={() => handleServicePress('Haircut')}>
                <View style={styles.featuredImagePlaceholder}>
                  <Ionicons name="cut" size={32} color="#2ecc71" />
                </View>
                <Text style={styles.featuredTitle}>Haircut</Text>
                <Text style={styles.featuredPrice}>From $25</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.featuredCard} onPress={() => handleServicePress('Hair Coloring')}>
                <View style={styles.featuredImagePlaceholder}>
                  <Ionicons name="color-palette" size={32} color="#2ecc71" />
                </View>
                <Text style={styles.featuredTitle}>Hair Coloring</Text>
                <Text style={styles.featuredPrice}>From $50</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.featuredCard} onPress={() => handleServicePress('Spa Treatment')}>
                <View style={styles.featuredImagePlaceholder}>
                  <Ionicons name="flower" size={32} color="#2ecc71" />
                </View>
                <Text style={styles.featuredTitle}>Spa Treatment</Text>
                <Text style={styles.featuredPrice}>From $40</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <Text style={styles.sectionTitle}>Nearby Shops</Text>
          <View style={styles.categoriesContainer}>
            {renderShopCategory('Salon', 'cut-outline')}
            {renderShopCategory('Barbershop', 'person-outline')}
          </View>
        </View>
      </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const dummyShops = [
  {
    id: '1',
    name: 'Glamour Beauty Salon',
    rating: 4.5,
    isOpen: true,
    services: ['Haircut', 'Facial', 'Manicure'],
  },
  {
    id: '2',
    name: 'Style Studio',
    rating: 4.8,
    isOpen: true,
    services: ['Hair Styling', 'Makeup', 'Pedicure'],
  },
  {
    id: '3',
    name: 'Elite Cuts',
    rating: 4.2,
    isOpen: false,
    services: ['Haircut', 'Beard Trim', 'Hair Color'],
  },
];

import { colors, spacing, typography, shadows, borderRadius } from '../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  defaultAvatarContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 40,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
  profileSection: {
    padding: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  shopList: {
    flex: 1,
    padding: 16,
  },
  shopItem: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm
  },
  shopInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  shopDistance: {
    fontSize: 14,
    color: '#666',
  },
  shopServices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  serviceTag: {
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  serviceText: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff'
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginLeft: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  searchResults: {
    flex: 1,
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  loader: {
    marginTop: 20,
  },
  searchResultItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  shopMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  ratingText: {
    fontSize: 14,
    color: '#f1c40f',
    marginRight: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  serviceTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 998,
  },
  menu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#f8f8f8',
    zIndex: 999,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    paddingTop: 80,
  },
  menuHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  featuredScrollView: {
    marginHorizontal: -20,
  },
  featuredContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  featuredCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredImagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featuredPrice: {
    fontSize: 14,
    color: '#2ecc71',
    fontWeight: '500',
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
  },
});