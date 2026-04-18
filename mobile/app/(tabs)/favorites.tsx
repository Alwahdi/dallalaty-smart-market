import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { supabase } from '@/lib/supabase';
import { Property } from '@/hooks/useProperties';
import PropertyCard from '@/components/PropertyCard';
import PropertyCardSkeleton from '@/components/PropertyCardSkeleton';
import EmptyState from '@/components/EmptyState';
import { Layout } from '@/constants/Layout';
import { useRouter } from 'expo-router';

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { favoriteIds, refresh: refreshFavIds } = useFavorites();
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavoriteProperties = useCallback(async (isRefresh = false) => {
    if (!user?.id) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      if (favoriteIds.length === 0) {
        setProperties([]);
        return;
      }

      const { data } = await supabase
        .from('properties')
        .select('*')
        .in('id', favoriteIds);

      if (data) {
        setProperties(data);
      }
    } catch {
      // Handle silently
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, favoriteIds]);

  useEffect(() => {
    fetchFavoriteProperties();
  }, [fetchFavoriteProperties]);

  const handleRefresh = () => {
    refreshFavIds();
    fetchFavoriteProperties(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>المفضلة</Text>
        {properties.length > 0 && (
          <View style={[styles.countBadge, { backgroundColor: colors.primaryMuted }]}>
            <Text style={[styles.countText, { color: colors.primary }]}>
              {properties.length}
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={loading ? [] : properties}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <PropertyCard property={item} />}
        ListEmptyComponent={
          loading ? (
            <View style={styles.skeletons}>
              {[1, 2].map(i => (
                <PropertyCardSkeleton key={i} />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="heart-outline"
              title="لا توجد مفضلات"
              subtitle="اضغط على أيقونة القلب في أي إعلان لحفظه هنا"
              actionLabel="تصفح الإعلانات"
              onAction={() => router.push('/(tabs)/explore')}
            />
          )
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Layout.spacing.screenPadding,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: '800',
    writingDirection: 'rtl',
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Layout.borderRadius.full,
  },
  countText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: Layout.spacing.screenPadding,
    paddingBottom: 20,
    flexGrow: 1,
  },
  skeletons: {
    gap: 0,
  },
});
