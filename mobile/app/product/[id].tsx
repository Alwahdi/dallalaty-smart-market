import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
  Dimensions,
  Linking,
  Share,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useProperty, useProperties } from '@/hooks/useProperties';
import { useFavorites } from '@/hooks/useFavorites';
import PropertyCard from '@/components/PropertyCard';
import { Layout } from '@/constants/Layout';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 0.75;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const { property, loading } = useProperty(id);
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Fetch related properties
  const { properties: relatedProperties } = useProperties({
    category: property?.category || undefined,
    limit: 4,
  });

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          جاري التحميل...
        </Text>
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          لم يتم العثور على الإعلان
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backLink, { backgroundColor: colors.primary }]}
        >
          <Text style={{ color: '#FFF', fontWeight: '700' }}>العودة</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : [];
  const favorite = isFavorite(property.id);

  const formatPrice = (price: number | null) => {
    if (!price) return 'السعر عند التواصل';
    return `${price.toLocaleString('ar-SA')} ر.س`;
  };

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(property.id);
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

  const handleWhatsApp = () => {
    const phone = property.agent_whatsapp || property.agent_phone;
    if (phone) {
      const url = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً، أستفسر عن: ${property.title}`)}`;
      Linking.openURL(url);
    }
  };

  const handleCall = () => {
    const phone = property.agent_phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const scrollToImage = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentImageIndex(index);
  };

  const DetailRow = ({
    icon,
    label,
    value,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
  }) => (
    <View style={[styles.detailRow, { borderBottomColor: colors.borderLight }]}>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
      <View style={styles.detailLabel}>
        <Text style={[styles.detailLabelText, { color: colors.textSecondary }]}>
          {label}
        </Text>
        <Ionicons name={icon} size={18} color={colors.textMuted} />
      </View>
    </View>
  );

  const related = relatedProperties.filter(p => p.id !== property.id).slice(0, 3);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageSection}>
          {images.length > 0 ? (
            <>
              <FlatList
                ref={flatListRef}
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(
                    e.nativeEvent.contentOffset.x / width
                  );
                  setCurrentImageIndex(index);
                }}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                )}
              />
              {/* Dots */}
              {images.length > 1 && (
                <View style={styles.dotsContainer}>
                  {images.map((_, index) => (
                    <Pressable
                      key={index}
                      onPress={() => scrollToImage(index)}
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            index === currentImageIndex
                              ? colors.primary
                              : '#FFFFFF80',
                          width: index === currentImageIndex ? 24 : 8,
                        },
                      ]}
                    />
                  ))}
                </View>
              )}
              {/* Counter */}
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {currentImageIndex + 1}/{images.length}
                </Text>
              </View>
            </>
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.skeleton }]}>
              <Ionicons name="image-outline" size={60} color={colors.textMuted} />
            </View>
          )}

          {/* Back Button */}
          <SafeAreaView edges={['top']} style={styles.topActions}>
            <Pressable
              onPress={() => router.back()}
              style={[styles.topButton, { backgroundColor: colors.card + 'E0' }]}
            >
              <Ionicons name="arrow-forward" size={22} color={colors.text} />
            </Pressable>
            <View style={styles.topActionsRight}>
              <Pressable
                onPress={handleShare}
                style={[styles.topButton, { backgroundColor: colors.card + 'E0' }]}
              >
                <Ionicons name="share-outline" size={22} color={colors.text} />
              </Pressable>
              <Pressable
                onPress={handleFavorite}
                style={[styles.topButton, { backgroundColor: colors.card + 'E0' }]}
              >
                <Ionicons
                  name={favorite ? 'heart' : 'heart-outline'}
                  size={22}
                  color={favorite ? colors.error : colors.text}
                />
              </Pressable>
            </View>
          </SafeAreaView>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Listing Type Badge */}
          {property.listing_type && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    property.listing_type === 'rent' ? colors.info + '20' : colors.primary + '20',
                },
              ]}
            >
              <Text
                style={{
                  color:
                    property.listing_type === 'rent' ? colors.info : colors.primary,
                  fontWeight: '700',
                  fontSize: Layout.fontSize.sm,
                }}
              >
                {property.listing_type === 'rent' ? 'للإيجار' : 'للبيع'}
              </Text>
            </View>
          )}

          {/* Title & Price */}
          <Text style={[styles.title, { color: colors.text }]}>{property.title}</Text>
          <Text style={[styles.price, { color: colors.primary }]}>
            {formatPrice(property.price)}
          </Text>

          {/* Location */}
          {property.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={18} color={colors.textMuted} />
              <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                {property.location}
                {property.city ? ` - ${property.city}` : ''}
              </Text>
            </View>
          )}

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            {property.bedrooms != null && (
              <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
                <Ionicons name="bed-outline" size={20} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {property.bedrooms}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                  غرف
                </Text>
              </View>
            )}
            {property.bathrooms != null && (
              <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
                <Ionicons name="water-outline" size={20} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {property.bathrooms}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                  حمامات
                </Text>
              </View>
            )}
            {property.area && (
              <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
                <Ionicons name="resize-outline" size={20} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {property.area}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                  م²
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {property.description && (
            <View
              style={[
                styles.section,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>الوصف</Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {property.description}
              </Text>
            </View>
          )}

          {/* Details */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              تفاصيل الإعلان
            </Text>
            {property.property_type && (
              <DetailRow icon="business-outline" label="نوع العقار" value={property.property_type} />
            )}
            {property.brand && (
              <DetailRow icon="car-outline" label="الماركة" value={property.brand} />
            )}
            {property.model && (
              <DetailRow icon="speedometer-outline" label="الموديل" value={property.model} />
            )}
            {property.year && (
              <DetailRow icon="calendar-outline" label="السنة" value={String(property.year)} />
            )}
            {property.mileage && (
              <DetailRow icon="speedometer-outline" label="الممشى" value={`${property.mileage.toLocaleString()} كم`} />
            )}
            <DetailRow
              icon="time-outline"
              label="تاريخ النشر"
              value={new Date(property.created_at).toLocaleDateString('ar-SA')}
            />
          </View>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <View
              style={[
                styles.section,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>المميزات</Text>
              <View style={styles.amenitiesGrid}>
                {property.amenities.map((amenity, i) => (
                  <View
                    key={i}
                    style={[styles.amenityChip, { backgroundColor: colors.primaryMuted }]}
                  >
                    <Ionicons name="checkmark" size={14} color={colors.primary} />
                    <Text style={[styles.amenityText, { color: colors.text }]}>
                      {amenity}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Agent Card */}
          {(property.agent_name || property.agent_phone) && (
            <View
              style={[
                styles.agentCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                معلومات المعلن
              </Text>
              <View style={styles.agentInfo}>
                <View style={[styles.agentAvatar, { backgroundColor: colors.primaryMuted }]}>
                  <Ionicons name="person" size={24} color={colors.primary} />
                </View>
                <View style={styles.agentDetails}>
                  {property.agent_name && (
                    <Text style={[styles.agentName, { color: colors.text }]}>
                      {property.agent_name}
                    </Text>
                  )}
                  {property.agent_phone && (
                    <Text style={[styles.agentPhone, { color: colors.textMuted }]}>
                      {property.agent_phone}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Related Properties */}
          {related.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>
                إعلانات مشابهة
              </Text>
              {related.map(p => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Contact Bar */}
      <View
        style={[
          styles.contactBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.cardBorder,
            ...(Layout.shadow.lg as object),
          },
        ]}
      >
        <SafeAreaView edges={['bottom']} style={styles.contactBarInner}>
          {/* WhatsApp */}
          <Pressable
            onPress={handleWhatsApp}
            style={[styles.contactButton, styles.whatsappButton]}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
            <Text style={styles.contactButtonText}>واتساب</Text>
          </Pressable>

          {/* Call */}
          <Pressable
            onPress={handleCall}
            style={[styles.contactButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="call" size={20} color="#FFF" />
            <Text style={styles.contactButtonText}>اتصال</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: Layout.fontSize.md,
  },
  backLink: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: Layout.borderRadius.md,
    marginTop: 8,
  },
  imageSection: {
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  galleryImage: {
    width: width,
    height: IMAGE_HEIGHT,
  },
  imagePlaceholder: {
    width: width,
    height: IMAGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#00000060',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  topActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  topActionsRight: {
    flexDirection: 'row',
    gap: 8,
  },
  topButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
  content: {
    paddingHorizontal: Layout.spacing.screenPadding,
    paddingTop: 18,
  },
  badge: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Layout.borderRadius.sm,
    marginBottom: 8,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: '800',
    writingDirection: 'rtl',
    textAlign: 'right',
    lineHeight: 34,
  },
  price: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 6,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  locationRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  locationText: {
    fontSize: Layout.fontSize.md,
    flex: 1,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginTop: 18,
    marginBottom: 18,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 14,
    borderRadius: Layout.borderRadius.md,
  },
  statValue: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: Layout.fontSize.xs,
  },
  section: {
    padding: 16,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '800',
    writingDirection: 'rtl',
    textAlign: 'right',
    marginBottom: 10,
  },
  description: {
    fontSize: Layout.fontSize.md,
    lineHeight: 24,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  detailRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  detailLabel: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  detailLabelText: {
    fontSize: Layout.fontSize.md,
    writingDirection: 'rtl',
  },
  detailValue: {
    fontSize: Layout.fontSize.md,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
  amenitiesGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Layout.borderRadius.sm,
  },
  amenityText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  agentCard: {
    padding: 16,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    marginBottom: 14,
  },
  agentInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  agentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentDetails: {
    flex: 1,
    gap: 4,
    alignItems: 'flex-end',
  },
  agentName: {
    fontSize: Layout.fontSize.md,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
  agentPhone: {
    fontSize: Layout.fontSize.sm,
  },
  relatedSection: {
    marginTop: 8,
  },
  contactBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  contactBarInner: {
    flexDirection: 'row-reverse',
    gap: 10,
    paddingHorizontal: Layout.spacing.screenPadding,
    paddingTop: 12,
    paddingBottom: 4,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: Layout.borderRadius.md,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  contactButtonText: {
    color: '#FFF',
    fontSize: Layout.fontSize.md,
    fontWeight: '700',
  },
});
