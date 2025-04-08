import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const SettingsScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [language, setLanguage] = useState('English');

  const SettingItem = ({ title, value, onValueChange, type = 'switch' }: {
    title: string;
    value: boolean | string;
    onValueChange: (value: boolean | string) => void;
    type?: 'switch' | 'select';
  }) => (
    <View style={styles.settingItem}>
      <Text style={styles.settingTitle}>{title}</Text>
      {type === 'switch' ? (
        <Switch
          value={value as boolean}
          onValueChange={onValueChange as (value: boolean) => void}
          trackColor={{ false: '#767577', true: '#2ecc71' }}
          thumbColor={value ? '#fff' : '#f4f3f4'}
        />
      ) : (
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => onValueChange(value)}
        >
          <Text style={styles.selectButtonText}>{value}</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );

  const handleDarkModeChange = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      setIsDarkMode(value);
    }
  };

  const handleNotificationsChange = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      setNotifications(value);
    }
  };

  const handleEmailUpdatesChange = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      setEmailUpdates(value);
    }
  };

  const handleLanguageChange = (value: boolean | string) => {
    if (typeof value === 'string') {
      setLanguage(value);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <SettingItem
          title="Dark Mode"
          value={isDarkMode}
          onValueChange={handleDarkModeChange}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <SettingItem
          title="Push Notifications"
          value={notifications}
          onValueChange={handleNotificationsChange}
        />
        <SettingItem
          title="Email Updates"
          value={emailUpdates}
          onValueChange={handleEmailUpdatesChange}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        <SettingItem
          title="Language"
          value={language}
          onValueChange={handleLanguageChange}
          type="select"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
});