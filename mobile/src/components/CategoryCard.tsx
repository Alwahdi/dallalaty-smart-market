import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
}

export default function CategoryCard({ category, onPress }: CategoryCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        width: 90,
        alignItems: 'center',
        backgroundColor: isDark ? colors.card : '#fff',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <View style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
      }}>
        <Text style={{ fontSize: 22 }}>{category.icon || '📦'}</Text>
      </View>
      <Text
        numberOfLines={1}
        style={{
          fontSize: 12,
          fontWeight: '700',
          color: colors.foreground,
          textAlign: 'center',
          writingDirection: 'rtl',
        }}
      >
        {category.title}
      </Text>
      {category.subtitle && (
        <Text
          numberOfLines={1}
          style={{
            fontSize: 10,
            color: colors.mutedForeground,
            textAlign: 'center',
            writingDirection: 'rtl',
            marginTop: 2,
          }}
        >
          {category.subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
}
