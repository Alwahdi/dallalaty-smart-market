import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Property } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 12 * 3) / 2;

interface PropertyCardProps {
  property: Property;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
}

export default function PropertyCard({
  property,
  isFavorite,
  onToggleFavorite,
  onPress,
}: PropertyCardProps) {
  const { colors, isDark } = useTheme();
  const hasImage = property.images?.length > 0;
  const priceText = property.price ? `${property.price.toLocaleString()} ر.ي` : 'اتصل';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        width: CARD_WIDTH,
        backgroundColor: isDark ? colors.card : '#fff',
        borderRadius: 14,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      {/* Image */}
      <View style={{ position: 'relative' }}>
        {hasImage ? (
          <Image
            source={{ uri: property.images[0] }}
            style={{ width: '100%', height: CARD_WIDTH * 0.7, borderTopLeftRadius: 14, borderTopRightRadius: 14 }}
            resizeMode="cover"
          />
        ) : (
          <View style={{
            width: '100%',
            height: CARD_WIDTH * 0.7,
            backgroundColor: isDark ? colors.muted : '#f0ecdc',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 32 }}>🏠</Text>
          </View>
        )}

        {/* Favorite Button */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation?.();
            onToggleFavorite();
          }}
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(0,0,0,0.35)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16 }}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>

        {/* Listing Type Badge */}
        {property.listing_type && (
          <View style={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: property.listing_type === 'sale' ? colors.primary : '#22c55e',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 8,
          }}>
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>
              {property.listing_type === 'sale' ? 'للبيع' : 'للإيجار'}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={{ padding: 10 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 13,
            fontWeight: '700',
            color: colors.foreground,
            textAlign: 'right',
            writingDirection: 'rtl',
            marginBottom: 4,
          }}
        >
          {property.title}
        </Text>

        <Text style={{
          fontSize: 15,
          fontWeight: '800',
          color: colors.primary,
          textAlign: 'right',
          writingDirection: 'rtl',
          marginBottom: 4,
        }}>
          {priceText}
        </Text>

        {property.location && (
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 3, marginBottom: 4 }}>
            <Text style={{ fontSize: 10 }}>📍</Text>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 11,
                color: colors.mutedForeground,
                writingDirection: 'rtl',
                flex: 1,
              }}
            >
              {property.location}
            </Text>
          </View>
        )}

        {/* Specs Row */}
        {(property.bedrooms || property.bathrooms || property.area_sqm) && (
          <View style={{
            flexDirection: 'row-reverse',
            gap: 8,
            marginTop: 4,
            paddingTop: 6,
            borderTopWidth: 1,
            borderTopColor: colors.border + '50',
          }}>
            {property.bedrooms != null && (
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 2 }}>
                <Text style={{ fontSize: 10 }}>🛏️</Text>
                <Text style={{ fontSize: 10, color: colors.mutedForeground }}>{property.bedrooms}</Text>
              </View>
            )}
            {property.bathrooms != null && (
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 2 }}>
                <Text style={{ fontSize: 10 }}>🚿</Text>
                <Text style={{ fontSize: 10, color: colors.mutedForeground }}>{property.bathrooms}</Text>
              </View>
            )}
            {property.area_sqm != null && (
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 2 }}>
                <Text style={{ fontSize: 10 }}>📐</Text>
                <Text style={{ fontSize: 10, color: colors.mutedForeground }}>{property.area_sqm}م²</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
