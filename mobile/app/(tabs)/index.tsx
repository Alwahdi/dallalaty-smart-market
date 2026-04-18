import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useProperties, useCategories, Property } from '@/hooks/useProperties';
import { useNotifications } from '@/hooks/useNotifications';
import PropertyCard from '@/components/PropertyCard';
import PropertyCardSkeleton from '@/components/PropertyCardSkeleton';
import CategoryCard from '@/components/CategoryCard';
import { Layout } from '@/constants/Layout';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, profile } = useAuth();
  const { unreadCount } = useNotifications();
  const { properties, loading, refreshing, refresh } = useProperties({ limit: 8 });
  const { categories, loading: categoriesLoading } = useCategories();
  const router = useRouter();

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'مساء النور';
  };

  const renderHeader = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerActions}>
          <Pressable
            onPress={toggleTheme}
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            hitSlop={8}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={20}
              color={colors.text}
            />
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tabs)/notifications')}
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            hitSlop={8}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
            {unreadCount > 0 && (
              <View style={[styles.notifDot, { backgroundColor: colors.error }]} />
            )}
          </Pressable>
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.greeting, { color: colors.textMuted }]}>{greeting()} 👋</Text>
          <Text style={[styles.userName, { color: colors.text }]}>
            {profile?.full_name || 'مرحباً'}
          </Text>
        </View>
      </View>

      {/* Hero Card */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/(tabs)/explore');
        }}
      >
        <LinearGradient
          colors={colors.gradient.gold as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroContent}>
            <Ionicons name="storefront" size={36} color="#FFF" />
            <Text style={styles.heroTitle}>دلالتي - السوق الذكي</Text>
            <Text style={styles.heroSubtitle}>
              اكتشف أفضل العروض العقارية والتجارية
            </Text>
          </View>
          <View style={styles.heroAction}>
            <Text style={styles.heroActionText}>تصفح الآن</Text>
            <Ionicons name="arrow-back" size={16} color="#FFF" />
          </View>
        </LinearGradient>
      </Pressable>

      {/* Quick Search */}
      <Pressable
        onPress={() => router.push('/(tabs)/explore')}
        style={[
          styles.searchBar,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search-outline" size={20} color={colors.textMuted} />
        <Text style={[styles.searchPlaceholder, { color: colors.textMuted }]}>
          ابحث عن عقارات، سيارات، منتجات...
        </Text>
      </Pressable>

      {/* Categories Section */}
      <View style={styles.sectionHeader}>
        <Pressable
          onPress={() => router.push('/(tabs)/explore')}
          style={styles.sectionLink}
        >
          <Ionicons name="arrow-back" size={16} color={colors.primary} />
          <Text style={[styles.sectionLinkText, { color: colors.primary }]}>
            عرض الكل
          </Text>
        </Pressable>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>الأقسام</Text>
      </View>
    </Animated.View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesGrid}>
      {categoriesLoading
        ? Array.from({ length: 6 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.categoryPlaceholder,
                { backgroundColor: colors.skeleton, borderColor: colors.cardBorder },
              ]}
            />
          ))
        : categories.slice(0, 6).map(cat => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
    </View>
  );

  const renderFeaturedHeader = () => (
    <View style={styles.sectionHeader}>
      <Pressable
        onPress={() => router.push('/(tabs)/explore')}
        style={styles.sectionLink}
      >
        <Ionicons name="arrow-back" size={16} color={colors.primary} />
        <Text style={[styles.sectionLinkText, { color: colors.primary }]}>
          عرض الكل
        </Text>
      </Pressable>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>أحدث الإعلانات</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderCategories()}
        {renderFeaturedHeader()}

        {/* Featured Properties */}
        {loading ? (
          <View style={styles.propertiesList}>
            {[1, 2, 3].map(i => (
              <PropertyCardSkeleton key={i} />
            ))}
          </View>
        ) : (
          <View style={styles.propertiesList}>
            {properties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </View>
        )}

        {/* Bottom padding */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Layout.spacing.screenPadding,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  headerText: {
    gap: 2,
    alignItems: 'flex-end',
  },
  greeting: {
    fontSize: Layout.fontSize.sm,
    writingDirection: 'rtl',
  },
  userName: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '800',
    writingDirection: 'rtl',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  heroCard: {
    borderRadius: Layout.borderRadius.xl,
    padding: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  heroContent: {
    gap: 8,
    alignItems: 'flex-end',
  },
  heroTitle: {
    color: '#FFF',
    fontSize: Layout.fontSize.xxl,
    fontWeight: '900',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  heroSubtitle: {
    color: '#FFFFFFCC',
    fontSize: Layout.fontSize.md,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  heroAction: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF25',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Layout.borderRadius.md,
  },
  heroActionText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: Layout.fontSize.sm,
  },
  searchBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 20,
  },
  searchPlaceholder: {
    fontSize: Layout.fontSize.md,
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '800',
    writingDirection: 'rtl',
  },
  sectionLink: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  sectionLinkText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: Layout.spacing.cardGap,
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  categoryPlaceholder: {
    width: (width - 48 - 24) / 3,
    height: 100,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
  },
  propertiesList: {
    gap: 0,
  },
});
