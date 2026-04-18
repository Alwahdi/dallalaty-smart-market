import { Dimensions, Platform, I18nManager } from 'react-native';

const { width, height } = Dimensions.get('window');

// Enable RTL for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export const Layout = {
  window: { width, height },
  isSmallDevice: width < 375,
  isTablet: width >= 768,
  padding: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    hero: 32,
  },
  spacing: {
    cardGap: 12,
    sectionGap: 24,
    screenPadding: 16,
  },
  shadow: {
    sm: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
    md: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
    lg: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
};
