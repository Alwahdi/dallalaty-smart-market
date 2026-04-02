import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { useProperties, useCategories } from '../hooks/useProperties';
import { useFavorites } from '../hooks/useFavorites';
import { RootStackParamList, MainTabParamList } from '../navigation/AppNavigator';
import PropertyCard from '../components/PropertyCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PropertiesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useTheme();
  const { categories } = useCategories();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { properties, isLoading, isRefreshing, refresh } = useProperties({
    category: selectedCategory || undefined,
    searchQuery: searchQuery || undefined,
  });

  const renderHeader = () => (
    <View>
      {/* Title */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{
          fontSize: 22,
          fontWeight: '800',
          color: colors.foreground,
          textAlign: 'right',
          writingDirection: 'rtl',
        }}>
          العقارات والمنتجات
        </Text>
        <Text style={{
          fontSize: 13,
          color: colors.mutedForeground,
          textAlign: 'right',
          writingDirection: 'rtl',
          marginTop: 2,
        }}>
          {properties.length} نتيجة
        </Text>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
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
            placeholder="ابحث عن عقار..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={{ fontSize: 16, color: colors.mutedForeground }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 8, marginBottom: 16 }}
        style={{ direction: 'rtl' }}
      >
        <TouchableOpacity
          onPress={() => setSelectedCategory(null)}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: !selectedCategory ? colors.primary : (isDark ? colors.card : colors.input),
            borderWidth: 1,
            borderColor: !selectedCategory ? colors.primary : colors.border,
          }}
        >
          <Text style={{
            fontSize: 13,
            fontWeight: '600',
            color: !selectedCategory ? '#fff' : colors.foreground,
            writingDirection: 'rtl',
          }}>
            الكل
          </Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setSelectedCategory(cat.slug === selectedCategory ? null : cat.slug)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: selectedCategory === cat.slug ? colors.primary : (isDark ? colors.card : colors.input),
              borderWidth: 1,
              borderColor: selectedCategory === cat.slug ? colors.primary : colors.border,
            }}
          >
            <Text style={{
              fontSize: 13,
              fontWeight: '600',
              color: selectedCategory === cat.slug ? '#fff' : colors.foreground,
              writingDirection: 'rtl',
            }}>
              {cat.icon ? `${cat.icon} ` : ''}{cat.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

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
          isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.foreground,
                textAlign: 'center',
                writingDirection: 'rtl',
                marginBottom: 4,
              }}>
                لا توجد نتائج
              </Text>
              <Text style={{
                fontSize: 13,
                color: colors.mutedForeground,
                textAlign: 'center',
                writingDirection: 'rtl',
              }}>
                جرب تغيير معايير البحث
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
