import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { useFavorites } from '../hooks/useFavorites';
import { RootStackParamList } from '../navigation/AppNavigator';
import PropertyCard from '../components/PropertyCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function FavoritesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useTheme();
  const { favorites, isLoading, isFavorite, toggleFavorite, refreshFavorites } = useFavorites();

  const properties = favorites
    .filter((f) => f.properties)
    .map((f) => f.properties!);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <Text style={{
          fontSize: 22,
          fontWeight: '800',
          color: colors.foreground,
          textAlign: 'right',
          writingDirection: 'rtl',
        }}>
          ❤️ المفضلة
        </Text>
        <Text style={{
          fontSize: 13,
          color: colors.mutedForeground,
        }}>
          {properties.length} عقار
        </Text>
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 12, gap: 10 }}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
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
            refreshing={isLoading}
            onRefresh={refreshFavorites}
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
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 64, marginBottom: 16 }}>💔</Text>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.foreground,
                textAlign: 'center',
                writingDirection: 'rtl',
                marginBottom: 8,
              }}>
                لا توجد عقارات مفضلة
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.mutedForeground,
                textAlign: 'center',
                writingDirection: 'rtl',
                paddingHorizontal: 40,
                marginBottom: 20,
              }}>
                اضغط على ❤️ في أي عقار لإضافته هنا
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Main' as any)}
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>تصفح العقارات</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
