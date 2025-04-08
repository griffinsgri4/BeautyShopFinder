import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthMode = 'login' | 'signup' | 'forgot';

export const AuthScreen = ({ navigation }: any) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAuth = async () => {
    try {
      if (!email || !validateEmail(email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }

      if (mode !== 'forgot' && (!password || password.length < 6)) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }

      if (mode === 'signup') {
        if (password !== confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          return;
        }
        if (!name.trim()) {
          Alert.alert('Error', 'Please enter your name');
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        await AsyncStorage.setItem('lastActiveTime', Date.now().toString());
        Alert.alert('Success', 'Account created successfully!');
        navigation.replace('HomeRoot');
      } else if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        await AsyncStorage.setItem('lastActiveTime', Date.now().toString());
        navigation.replace('HomeRoot');
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        Alert.alert('Success', 'Password reset email sent');
        setMode('login');
      }
    } catch (error: any) {
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please try logging in.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'This operation is not allowed. Please contact support.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Authentication popup was closed. Please try again.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Only one popup request is allowed at a time.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log in again to complete this action.';
      } else {
        console.error('Firebase Auth Error:', error.code, error.message);
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>BeautyShopFinder</Text>
      <View style={styles.form}>
        <Text style={styles.title}>
          {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
        </Text>
        
        {mode === 'signup' && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        {mode !== 'forgot' && (
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        )}
        
        {mode === 'signup' && (
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        )}

        <TouchableOpacity style={styles.button} onPress={handleAuth}>
          <Text style={styles.buttonText}>
            {mode === 'login' ? 'Login' : mode === 'signup' ? 'Sign Up' : 'Reset Password'}
          </Text>
        </TouchableOpacity>

        <View style={styles.links}>
          {mode === 'login' ? (
            <>
              <TouchableOpacity onPress={() => setMode('forgot')}>
                <Text style={styles.link}>Forgot Password?</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMode('signup')}>
                <Text style={styles.link}>Create Account</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={() => setMode('login')}>
              <Text style={styles.link}>Back to Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 48,
    color: '#333',
  },
  form: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ff6b6b',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  links: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  link: {
    color: '#ff6b6b',
    fontSize: 16,
  },
});