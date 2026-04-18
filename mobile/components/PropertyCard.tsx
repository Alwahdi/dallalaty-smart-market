import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useFavorites } from '@/hooks/useFavorites';
import { Layout } from '@/constants/Layout';
import { Property } from '@/hooks/useProperties';

interface PropertyCardProps {
  property: Property;
  compact?: boolean;
}

export default function PropertyCard({ property, compact = false }: PropertyCardProps) {
  const { colors } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();
  const favorite = isFavorite(property.id);

  const imageUrl = property.images?.[0] || null;

  const formatPrice = (price: number | null) => {
    if (!price) return 'السعر عند التواصل';
    return `${price.toLocaleString('ar-SA')} ر.س`;
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/product/${property.id}`);
  };

  const handleFavorite = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await toggleFavorite(property.id);
  };

  const handleWhatsApp = () => {
    if (property.agent_whatsapp) {
      const url = `https://wa.me/${property.agent_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً، أستفسر عن: ${property.title}`)}`;
      Linking.openURL(url);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${property.title}\n${formatPrice(property.price)}\n${property.location || ''}\n\nشاهد المزيد في تطبيق دلالتي`,
      });
    } catch {
      // Cancelled
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          ...(Layout.shadow.md as object),
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        compact && styles.cardCompact,
      ]}
    >
      {/* Image */}
      <View style={[styles.imageContainer, compact && styles.imageContainerCompact]}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.skeleton }]}>
            <Ionicons name="image-outline" size={40} color={colors.textMuted} />
          </View>
        )}

        {/* Favorite Button */}
        <Pressable
          onPress={handleFavorite}
          hitSlop={8}
          style={[styles.favoriteButton, { backgroundColor: colors.card + 'E0' }]}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={20}
            color={favorite ? colors.error : colors.text}
          />
        </Pressable>

        {/* Listing Type Badge */}
        {property.listing_type && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  property.listing_type === 'rent' ? colors.info : colors.primary,
              },
            ]}
          >
            <Text style={styles.badgeText}>
              {property.listing_type === 'rent' ? 'إيجار' : 'بيع'}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={2}
        >
          {property.title}
        </Text>

        {/* Price */}
        <Text style={[styles.price, { color: colors.primary }]}>
          {formatPrice(property.price)}
        </Text>

        {/* Location */}
        {property.location && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text
              style={[styles.location, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {property.location}
              {property.city ? ` - ${property.city}` : ''}
            </Text>
          </View>
        )}

        {/* Amenities Row */}
        {!compact && (
          <View style={[styles.amenitiesRow, { borderTopColor: colors.borderLight }]}>
            {property.bedrooms != null && (
              <View style={styles.amenity}>
                <Ionicons name="bed-outline" size={14} color={colors.textMuted} />
                <Text style={[styles.amenityText, { color: colors.textMuted }]}>
                  {property.bedrooms}
                </Text>
              </View>
            )}
            {property.bathrooms != null && (
              <View style={styles.amenity}>
                <Ionicons name="water-outline" size={14} color={colors.textMuted} />
                <Text style={[styles.amenityText, { color: colors.textMuted }]}>
                  {property.bathrooms}
                </Text>
              </View>
            )}
            {property.area && (
              <View style={styles.amenity}>
                <Ionicons name="resize-outline" size={14} color={colors.textMuted} />
                <Text style={[styles.amenityText, { color: colors.textMuted }]}>
                  {property.area} م²
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        {!compact && (
          <View style={styles.actions}>
            {property.agent_whatsapp && (
              <Pressable
                onPress={handleWhatsApp}
                style={[styles.actionButton, { backgroundColor: '#25D36620' }]}
              >
                <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                <Text style={[styles.actionText, { color: '#25D366' }]}>تواصل</Text>
              </Pressable>
            )}
            <Pressable
              onPress={handleShare}
              style={[styles.actionButton, { backgroundColor: colors.primaryMuted }]}
            >
              <Ionicons name="share-outline" size={16} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>مشاركة</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Layout.spacing.cardGap,
  },
  cardCompact: {
    width: 200,
    marginLeft: Layout.spacing.cardGap,
  },
  imageContainer: {
    height: 180,
    position: 'relative',
  },
  imageContainerCompact: {
    height: 130,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: Layout.fontSize.md,
    fontWeight: '700',
    lineHeight: 22,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  price: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '800',
    marginTop: 6,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  locationRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  location: {
    fontSize: Layout.fontSize.sm,
    flex: 1,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  amenitiesRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 16,
  },
  amenity: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  amenityText: {
    fontSize: Layout.fontSize.sm,
  },
  actions: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Layout.borderRadius.sm,
    flex: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
  },
});
