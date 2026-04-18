import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Layout } from '@/constants/Layout';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onFilterPress?: () => void;
  placeholder?: string;
  showFilter?: boolean;
}

export default function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onFilterPress,
  placeholder = 'ابحث عن عقارات، سيارات، منتجات...',
  showFilter = true,
}: SearchBarProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name="search-outline" size={20} color={colors.textMuted} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          textAlign="right"
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
      {showFilter && onFilterPress && (
        <Pressable
          onPress={onFilterPress}
          style={[
            styles.filterButton,
            { backgroundColor: colors.primary },
          ]}
        >
          <Ionicons name="options-outline" size={20} color="#FFF" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Layout.spacing.screenPadding,
    marginVertical: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: Layout.fontSize.md,
    height: '100%',
    writingDirection: 'rtl',
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
