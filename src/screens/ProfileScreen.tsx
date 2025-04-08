import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, AppState, AppStateStatus } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';

export const ProfileScreen = ({ navigation }: any) => {
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    const checkUserActivity = async () => {
      const lastActiveTime = await AsyncStorage.getItem('lastActiveTime');
      if (lastActiveTime) {
        const inactiveTime = Date.now() - parseInt(lastActiveTime);
        // Auto logout after 15 minutes of inactivity
        if (inactiveTime > 15 * 60 * 1000) {
          handleLogout();
        }
      }
    };

    const updateLastActiveTime = async () => {
      await AsyncStorage.setItem('lastActiveTime', Date.now().toString());
    };

    const loadUserProfile = () => {
      const user = auth.currentUser;
      if (user) {
        setUserProfile({
          name: user.displayName || 'N/A',
          email: user.email || 'N/A',
        });
      } else {
        handleLogout();
      }
    };

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        await checkUserActivity();
        await updateLastActiveTime();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Clear session when app goes to background
        handleLogout();
      }
    };

    loadUserProfile();
    checkUserActivity();
    updateLastActiveTime();

    const activityInterval = setInterval(checkUserActivity, 60000); // Check every minute
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      clearInterval(activityInterval);
      appStateSubscription.remove();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('lastActiveTime');
      navigation.replace('Auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{userProfile.name}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{userProfile.email}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});