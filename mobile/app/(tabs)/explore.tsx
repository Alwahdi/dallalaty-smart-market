import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useProperties, useCategories, Property } from '@/hooks/useProperties';
import PropertyCard from '@/components/PropertyCard';
import PropertyCardSkeleton from '@/components/PropertyCardSkeleton';
import SearchBar from '@/components/SearchBar';
import EmptyState from '@/components/EmptyState';
import { Layout } from '@/constants/Layout';

const LISTING_TYPES = [
  { value: '', label: 'الكل' },
  { value: 'sale', label: 'بيع' },
  { value: 'rent', label: 'إيجار' },
];

export default function ExploreScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ category?: string }>();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(params.category || '');
  const [listingType, setListingType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { categories } = useCategories();
  const { properties, loading, refreshing, refresh } = useProperties({
    category: selectedCategory || undefined,
    search: search || undefined,
    listingType: listingType || undefined,
  });

  const handleCategorySelect = useCallback((slug: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(prev => (prev === slug ? '' : slug));
  }, []);

  const renderHeader = useCallback(
    () => (
      <View>
        {/* Search */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
          onFilterPress={() => setShowFilters(true)}
        />

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
          style={styles.chipScroll}
        >
          <Pressable
            onPress={() => handleCategorySelect('')}
            style={[
              styles.chip,
              {
                backgroundColor: selectedCategory === '' ? colors.primary : colors.surface,
                borderColor: selectedCategory === '' ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: selectedCategory === '' ? '#FFF' : colors.text },
              ]}
            >
              الكل
            </Text>
          </Pressable>
          {categories.map(cat => (
            <Pressable
              key={cat.id}
              onPress={() => handleCategorySelect(cat.slug)}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    selectedCategory === cat.slug ? colors.primary : colors.surface,
                  borderColor:
                    selectedCategory === cat.slug ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color:
                      selectedCategory === cat.slug ? '#FFF' : colors.text,
                  },
                ]}
              >
                {cat.title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Listing Type Tabs */}
        <View style={styles.listingTypeTabs}>
          {LISTING_TYPES.map(lt => (
            <Pressable
              key={lt.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setListingType(lt.value);
              }}
              style={[
                styles.listingTab,
                {
                  backgroundColor:
                    listingType === lt.value ? colors.primary + '18' : 'transparent',
                  borderColor:
                    listingType === lt.value ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.listingTabText,
                  {
                    color:
                      listingType === lt.value ? colors.primary : colors.textMuted,
                  },
                ]}
              >
                {lt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Results Count */}
        <View style={styles.resultsRow}>
          <Text style={[styles.resultsCount, { color: colors.textMuted }]}>
            {properties.length} نتيجة
          </Text>
        </View>
      </View>
    ),
    [search, selectedCategory, listingType, categories, properties.length, colors, handleCategorySelect]
  );

  const renderItem = useCallback(
    ({ item }: { item: Property }) => <PropertyCard property={item} />,
    []
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Title */}
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.text }]}>تصفح الإعلانات</Text>
      </View>

      <FlatList
        data={loading ? [] : properties}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          loading ? (
            <View style={styles.skeletons}>
              {[1, 2, 3, 4].map(i => (
                <PropertyCardSkeleton key={i} />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="search-outline"
              title="لا توجد نتائج"
              subtitle="جرب البحث بكلمات مختلفة أو غير الفلاتر"
            />
          )
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              تصفية النتائج
            </Text>
            <Pressable
              onPress={() => {
                setSelectedCategory('');
                setListingType('');
                setSearch('');
              }}
            >
              <Text style={[styles.clearText, { color: colors.error }]}>مسح الكل</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Category Filter */}
            <Text style={[styles.filterLabel, { color: colors.text }]}>القسم</Text>
            <View style={styles.filterOptions}>
              <Pressable
                onPress={() => setSelectedCategory('')}
                style={[
                  styles.filterOption,
                  {
                    backgroundColor:
                      selectedCategory === '' ? colors.primary : colors.surface,
                    borderColor:
                      selectedCategory === '' ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: selectedCategory === '' ? '#FFF' : colors.text,
                    fontWeight: '600',
                    fontSize: Layout.fontSize.sm,
                  }}
                >
                  الكل
                </Text>
              </Pressable>
              {categories.map(cat => (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.slug)}
                  style={[
                    styles.filterOption,
                    {
                      backgroundColor:
                        selectedCategory === cat.slug ? colors.primary : colors.surface,
                      borderColor:
                        selectedCategory === cat.slug ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: selectedCategory === cat.slug ? '#FFF' : colors.text,
                      fontWeight: '600',
                      fontSize: Layout.fontSize.sm,
                    }}
                  >
                    {cat.title}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Listing Type Filter */}
            <Text style={[styles.filterLabel, { color: colors.text, marginTop: 20 }]}>
              نوع الإعلان
            </Text>
            <View style={styles.filterOptions}>
              {LISTING_TYPES.map(lt => (
                <Pressable
                  key={lt.value}
                  onPress={() => setListingType(lt.value)}
                  style={[
                    styles.filterOption,
                    {
                      backgroundColor:
                        listingType === lt.value ? colors.primary : colors.surface,
                      borderColor:
                        listingType === lt.value ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: listingType === lt.value ? '#FFF' : colors.text,
                      fontWeight: '600',
                      fontSize: Layout.fontSize.sm,
                    }}
                  >
                    {lt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              onPress={() => setShowFilters(false)}
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.applyButtonText}>عرض النتائج ({properties.length})</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleRow: {
    paddingHorizontal: Layout.spacing.screenPadding,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: '800',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  listContent: {
    paddingHorizontal: Layout.spacing.screenPadding,
    paddingBottom: 20,
  },
  chipScroll: {
    marginBottom: 8,
  },
  chipContainer: {
    gap: 8,
    paddingVertical: 8,
    flexDirection: 'row-reverse',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Layout.borderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  listingTypeTabs: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginBottom: 12,
  },
  listingTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
  },
  listingTabText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  resultsRow: {
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  resultsCount: {
    fontSize: Layout.fontSize.sm,
    writingDirection: 'rtl',
  },
  skeletons: {
    gap: 0,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: '#0001',
  },
  modalTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '800',
    writingDirection: 'rtl',
  },
  clearText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: Layout.spacing.screenPadding,
  },
  filterLabel: {
    fontSize: Layout.fontSize.md,
    fontWeight: '700',
    marginBottom: 10,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  filterOptions: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
  },
  modalFooter: {
    padding: Layout.spacing.screenPadding,
    paddingBottom: 32,
  },
  applyButton: {
    height: 52,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: Layout.fontSize.lg,
    fontWeight: '800',
  },
});
