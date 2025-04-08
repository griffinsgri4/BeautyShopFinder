// Theme configuration for gender-neutral beauty app

export const colors = {
  // Primary colors
  primary: '#008080', // Teal
  secondary: '#40E0D0', // Turquoise
  accent: '#20B2AA', // Light sea green

  // Neutral palette
  neutral100: '#FFFFFF',
  neutral200: '#F8F8F8',
  neutral300: '#E8E8E8',
  neutral400: '#D1D1D1',
  neutral500: '#A0A0A0',
  neutral600: '#717171',
  neutral700: '#4A4A4A',
  neutral800: '#2D2D2D',
  neutral900: '#1A1A1A',

  // Status colors
  success: '#20B2AA', // Light sea green
  error: '#FF6B6B', // Coral red
  warning: '#4DD0E1', // Light teal
  info: '#26A69A', // Teal green

  // UI specific colors
  background: '#FFFFFF',
  card: '#F8F8F8',
  border: '#E8E8E8',
  text: '#2D2D2D',
  textLight: '#717171',
  shadow: 'rgba(0, 0, 0, 0.1)'
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999
};

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4
  }
};