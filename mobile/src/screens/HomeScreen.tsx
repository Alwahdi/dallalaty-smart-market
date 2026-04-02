import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  I18nManager,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useProperties, useCategories } from '../hooks/useProperties';
import { useNotifications } from '../hooks/useNotifications';
import { useFavorites } from '../hooks/useFavorites';
import { RootStackParamList } from '../navigation/AppNavigator';
import PropertyCard from '../components/PropertyCard';
import CategoryCard from '../components/CategoryCard';
import { Property, Category } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useTheme();
  const { profile } = useAuth();
  const { properties, isLoading, isRefreshing, refresh } = useProperties({ limit: 10 });
  const { categories } = useCategories();
  const { unreadCount } = useNotifications();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');

  const renderHeader = () => (
    <View>
      {/* Header */}
      <View style={{
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 24 }}>🏪</Text>
          <View>
            <Text style={{
              fontSize: 20,
              fontWeight: '800',
              color: colors.primary,
              textAlign: 'right',
              writingDirection: 'rtl',
            }}>
              دلالتي
            </Text>
            <Text style={{
              fontSize: 11,
              color: colors.mutedForeground,
              textAlign: 'right',
              writingDirection: 'rtl',
            }}>
              السوق الذكي
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          style={{ padding: 8, position: 'relative' }}
        >
          <Text style={{ fontSize: 24 }}>🔔</Text>
          {unreadCount > 0 && (
            <View style={{
              position: 'absolute',
              top: 4,
              right: 4,
              backgroundColor: colors.destructive,
              borderRadius: 10,
              minWidth: 18,
              height: 18,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Welcome */}
      <View style={{
        paddingHorizontal: 16,
        paddingBottom: 12,
      }}>
        <Text style={{
          fontSize: 16,
          color: colors.foreground,
          textAlign: 'right',
          writingDirection: 'rtl',
          fontWeight: '600',
        }}>
          أهلاً {profile?.full_name || 'بك'} 👋
        </Text>
        <Text style={{
          fontSize: 13,
          color: colors.mutedForeground,
          textAlign: 'right',
          writingDirection: 'rtl',
          marginTop: 2,
        }}>
          ابحث عن أفضل العقارات والمنتجات
        </Text>
      </View>

      {/* Search */}
      <View style={{
        paddingHorizontal: 16,
        marginBottom: 16,
      }}>
        <View style={{
          flexDirection: 'row-reverse',
          alignItems: 'center',
          backgroundColor: isDark ? colors.card : colors.input,
          borderRadius: 12,
          paddingHorizontal: 14,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{ fontSize: 18, marginLeft: 8 }}>🔍</Text>
          <TextInput
            style={{
              flex: 1,
              paddingVertical: 12,
              fontSize: 14,
              color: colors.foreground,
              textAlign: 'right',
              writingDirection: 'rtl',
            }}
            placeholder="ابحث عن عقار أو منتج..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Categories */}
      {categories.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <View style={{
            flexDirection: 'row-reverse',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            marginBottom: 12,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.foreground,
              textAlign: 'right',
              writingDirection: 'rtl',
            }}>
              الأقسام
            </Text>
            <TouchableOpacity>
              <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '600' }}>عرض الكل</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}
            style={{ direction: 'rtl' }}
          >
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onPress={() => navigation.navigate('Main', { screen: 'Properties', params: { category: cat.slug } } as any)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Section Header */}
      <View style={{
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
      }}>
        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.foreground,
          textAlign: 'right',
          writingDirection: 'rtl',
        }}>
          أحدث العقارات
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Properties' } as any)}>
          <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '600' }}>عرض المزيد</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.mutedForeground, writingDirection: 'rtl' }}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 12, gap: 10 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🏠</Text>
            <Text style={{ fontSize: 16, color: colors.mutedForeground, textAlign: 'center', writingDirection: 'rtl' }}>
              لا توجد عقارات حالياً
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
