import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SettingsScreen } from '../screens/SettingsScreen';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { HomeScreen } from '../screens/HomeScreen';
import { ServicesScreen } from '../screens/ServicesScreen';
import { AppointmentsScreen } from '../screens/AppointmentsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ShopDiscoveryScreen } from '../screens/ShopDiscoveryScreen';
import { SalonScreen } from '../screens/SalonScreen';
import { BarberShopScreen } from '../screens/BarberShopScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { ShopDetailScreen } from '../screens/ShopDetailScreen';
import { RootStackParamList } from '../types';

const Tab = createBottomTabNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeRoot" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Salon" component={SalonScreen} />
      <Stack.Screen name="Barbershop" component={BarberShopScreen} />
      <Stack.Screen name="Services" component={ServicesScreen} />
      <Stack.Screen name="Appointments" component={AppointmentsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
    </Stack.Navigator>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'ShopDiscovery':
              iconName = focused ? 'search' : 'search-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2ecc71',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="ShopDiscovery" component={ShopDiscoveryScreen} />
    </Tab.Navigator>
  );
};

export const Navigation = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};