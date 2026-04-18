/**
 * Dallalaty color theme - Gold & Olive palette
 * Matches the web app's HSL color system
 */

export const Colors = {
  light: {
    primary: '#D4A843',        // Gold primary
    primaryGlow: '#E0B84D',    // Lighter gold
    primaryMuted: '#D4A84330', // Gold with opacity
    secondary: '#7A8C55',      // Olive green
    secondaryMuted: '#7A8C5530',
    background: '#FDFAF3',     // Warm off-white
    surface: '#FAF5E8',        // Slightly darker surface
    card: '#FFFFFF',
    cardBorder: '#F0E8D0',
    text: '#2D2518',           // Dark brown
    textSecondary: '#6B5E4A',
    textMuted: '#9B8E7A',
    border: '#E8DFC8',
    borderLight: '#F0E8D0',
    success: '#4CAF50',
    error: '#E53935',
    warning: '#FF9800',
    info: '#2196F3',
    shadow: '#00000015',
    overlay: '#00000050',
    tabBar: '#FFFFFF',
    tabBarBorder: '#F0E8D0',
    tabBarActive: '#D4A843',
    tabBarInactive: '#9B8E7A',
    skeleton: '#F0E8D0',
    skeletonHighlight: '#FAF5E8',
    gradient: {
      primary: ['#D4A843', '#C09530'],
      hero: ['#2D2518', '#4A3C2A', '#D4A843'],
      card: ['#FFFFFF', '#FAF5E8'],
      gold: ['#E0B84D', '#D4A843', '#C09530'],
    },
  },
  dark: {
    primary: '#E0B84D',
    primaryGlow: '#ECC85A',
    primaryMuted: '#E0B84D25',
    secondary: '#8FA060',
    secondaryMuted: '#8FA06025',
    background: '#151210',     // Very dark brown
    surface: '#1E1A16',
    card: '#252018',
    cardBorder: '#3A3228',
    text: '#F5EDD5',
    textSecondary: '#C8BCA0',
    textMuted: '#8A7E68',
    border: '#3A3228',
    borderLight: '#2E2820',
    success: '#66BB6A',
    error: '#EF5350',
    warning: '#FFA726',
    info: '#42A5F5',
    shadow: '#00000040',
    overlay: '#00000070',
    tabBar: '#1E1A16',
    tabBarBorder: '#3A3228',
    tabBarActive: '#E0B84D',
    tabBarInactive: '#8A7E68',
    skeleton: '#2E2820',
    skeletonHighlight: '#3A3228',
    gradient: {
      primary: ['#E0B84D', '#D4A843'],
      hero: ['#151210', '#252018', '#D4A843'],
      card: ['#252018', '#1E1A16'],
      gold: ['#ECC85A', '#E0B84D', '#D4A843'],
    },
  },
};

export type ThemeColors = typeof Colors.light;
