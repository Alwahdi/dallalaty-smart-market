import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { Layout } from '@/constants/Layout';
import { Category } from '@/hooks/useProperties';

// Map web icon names to Ionicons
const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  'building': 'business-outline',
  'home': 'home-outline',
  'car': 'car-outline',
  'sofa': 'bed-outline',
  'smartphone': 'phone-portrait-outline',
  'package': 'cube-outline',
  'shirt': 'shirt-outline',
  'wrench': 'build-outline',
  'truck': 'bus-outline',
  'bike': 'bicycle-outline',
  'laptop': 'laptop-outline',
  'tv': 'tv-outline',
  'camera': 'camera-outline',
  'book': 'book-outline',
  'watch': 'watch-outline',
  'gem': 'diamond-outline',
  'baby': 'happy-outline',
  'dumbbell': 'fitness-outline',
  'utensils': 'restaurant-outline',
  'gamepad': 'game-controller-outline',
  'music': 'musical-notes-outline',
  'palette': 'color-palette-outline',
  'land': 'map-outline',
  'default': 'grid-outline',
};

interface CategoryCardProps {
  category: Category;
  count?: number;
}

export default function CategoryCard({ category, count }: CategoryCardProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const iconName = ICON_MAP[category.icon || ''] || ICON_MAP['default'];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(tabs)/explore?category=${category.slug}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? colors.primaryMuted : colors.card,
          borderColor: colors.cardBorder,
          ...(Layout.shadow.sm as object),
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryMuted }]}>
        <Ionicons name={iconName} size={24} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {category.title}
      </Text>
      {count != null && (
        <Text style={[styles.count, { color: colors.textMuted }]}>
          {count} إعلان
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    padding: 14,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    width: (Layout.window.width - 48 - 24) / 3,
    gap: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  count: {
    fontSize: Layout.fontSize.xs,
  },
});
