import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { useProperty } from '../hooks/useProperties';
import { useFavorites } from '../hooks/useFavorites';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DetailRouteProp>();
  const { id } = route.params;
  const { colors, isDark } = useTheme();
  const { property, isLoading } = useProperty(id);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  if (isLoading || !property) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.mutedForeground }}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const images = property.images?.length > 0 ? property.images : [];
  const hasImages = images.length > 0;
  const priceText = property.price ? `${property.price.toLocaleString()} ر.ي` : 'السعر عند التواصل';

  const handleShare = async () => {
    try {
      await Share.share({
        title: property.title,
        message: `${property.title}\n${priceText}\n${property.location || ''}\n\nعبر تطبيق دلالتي`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleWhatsApp = () => {
    if (property.agent_phone) {
      const phone = property.agent_phone.replace(/[^0-9]/g, '');
      const message = encodeURIComponent(`مرحباً، أنا مهتم بـ: ${property.title}`);
      Linking.openURL(`https://wa.me/${phone}?text=${message}`);
    }
  };

  const handleCall = () => {
    if (property.agent_phone) {
      Linking.openURL(`tel:${property.agent_phone}`);
    }
  };

  const handleImageScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentImageIndex(index);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back + Actions Header */}
        <View style={{
          position: 'absolute',
          top: 8,
          left: 0,
          right: 0,
          flexDirection: 'row-reverse',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          zIndex: 10,
        }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(0,0,0,0.4)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 20 }}>→</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => toggleFavorite(property.id)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(0,0,0,0.4)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 18 }}>{isFavorite(property.id) ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(0,0,0,0.4)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 18 }}>📤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Image Gallery */}
        {hasImages ? (
          <View>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleImageScroll}
            >
              {images.map((img, idx) => (
                <Image
                  key={idx}
                  source={{ uri: img }}
                  style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.75 }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            {images.length > 1 && (
              <View style={{
                position: 'absolute',
                bottom: 12,
                alignSelf: 'center',
                flexDirection: 'row',
                gap: 6,
              }}>
                {images.map((_, idx) => (
                  <View
                    key={idx}
                    style={{
                      width: idx === currentImageIndex ? 20 : 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: idx === currentImageIndex ? colors.primary : 'rgba(255,255,255,0.5)',
                    }}
                  />
                ))}
              </View>
            )}
            <View style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}>
              <Text style={{ color: '#fff', fontSize: 12 }}>{currentImageIndex + 1}/{images.length}</Text>
            </View>
          </View>
        ) : (
          <View style={{
            width: SCREEN_WIDTH,
            height: SCREEN_WIDTH * 0.6,
            backgroundColor: isDark ? colors.card : colors.muted,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 64 }}>🏠</Text>
            <Text style={{ color: colors.mutedForeground, marginTop: 8 }}>لا توجد صور</Text>
          </View>
        )}

        {/* Content */}
        <View style={{ padding: 16 }}>
          {/* Title & Price */}
          <Text style={{
            fontSize: 22,
            fontWeight: '800',
            color: colors.foreground,
            textAlign: 'right',
            writingDirection: 'rtl',
            marginBottom: 4,
          }}>
            {property.title}
          </Text>

          <Text style={{
            fontSize: 24,
            fontWeight: '800',
            color: colors.primary,
            textAlign: 'right',
            writingDirection: 'rtl',
            marginBottom: 8,
          }}>
            {priceText}
          </Text>

          {/* Location */}
          {property.location && (
            <View style={{
              flexDirection: 'row-reverse',
              alignItems: 'center',
              gap: 4,
              marginBottom: 16,
            }}>
              <Text style={{ fontSize: 16 }}>📍</Text>
              <Text style={{
                fontSize: 14,
                color: colors.mutedForeground,
                writingDirection: 'rtl',
              }}>
                {property.location}{property.city ? ` - ${property.city}` : ''}
              </Text>
            </View>
          )}

          {/* Listing Type Badge */}
          {property.listing_type && (
            <View style={{
              alignSelf: 'flex-end',
              backgroundColor: property.listing_type === 'sale' ? colors.primary + '20' : colors.accent,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
              marginBottom: 16,
            }}>
              <Text style={{
                fontSize: 12,
                fontWeight: '700',
                color: property.listing_type === 'sale' ? colors.primary : colors.accentForeground,
                writingDirection: 'rtl',
              }}>
                {property.listing_type === 'sale' ? '🏷️ للبيع' : '🔑 للإيجار'}
              </Text>
            </View>
          )}

          {/* Specs */}
          {(property.bedrooms || property.bathrooms || property.area_sqm) && (
            <View style={{
              flexDirection: 'row-reverse',
              backgroundColor: isDark ? colors.card : colors.input,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              justifyContent: 'space-around',
            }}>
              {property.bedrooms != null && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24 }}>🛏️</Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginTop: 4 }}>{property.bedrooms}</Text>
                  <Text style={{ fontSize: 11, color: colors.mutedForeground }}>غرف نوم</Text>
                </View>
              )}
              {property.bathrooms != null && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24 }}>🚿</Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginTop: 4 }}>{property.bathrooms}</Text>
                  <Text style={{ fontSize: 11, color: colors.mutedForeground }}>حمام</Text>
                </View>
              )}
              {property.area_sqm != null && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24 }}>📐</Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginTop: 4 }}>{property.area_sqm}</Text>
                  <Text style={{ fontSize: 11, color: colors.mutedForeground }}>م²</Text>
                </View>
              )}
            </View>
          )}

          {/* Car/Furniture Specific */}
          {(property.brand || property.model || property.year) && (
            <View style={{
              backgroundColor: isDark ? colors.card : colors.input,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.foreground,
                textAlign: 'right',
                writingDirection: 'rtl',
                marginBottom: 8,
              }}>
                المواصفات
              </Text>
              {property.brand && (
                <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: colors.mutedForeground, writingDirection: 'rtl' }}>الماركة</Text>
                  <Text style={{ color: colors.foreground, fontWeight: '600' }}>{property.brand}</Text>
                </View>
              )}
              {property.model && (
                <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: colors.mutedForeground, writingDirection: 'rtl' }}>الموديل</Text>
                  <Text style={{ color: colors.foreground, fontWeight: '600' }}>{property.model}</Text>
                </View>
              )}
              {property.year && (
                <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: colors.mutedForeground, writingDirection: 'rtl' }}>السنة</Text>
                  <Text style={{ color: colors.foreground, fontWeight: '600' }}>{property.year}</Text>
                </View>
              )}
              {property.color && (
                <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: colors.mutedForeground, writingDirection: 'rtl' }}>اللون</Text>
                  <Text style={{ color: colors.foreground, fontWeight: '600' }}>{property.color}</Text>
                </View>
              )}
              {property.condition && (
                <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.mutedForeground, writingDirection: 'rtl' }}>الحالة</Text>
                  <Text style={{ color: colors.foreground, fontWeight: '600' }}>{property.condition}</Text>
                </View>
              )}
            </View>
          )}

          {/* Description */}
          {property.description && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.foreground,
                textAlign: 'right',
                writingDirection: 'rtl',
                marginBottom: 8,
              }}>
                الوصف
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.mutedForeground,
                textAlign: 'right',
                writingDirection: 'rtl',
                lineHeight: 22,
              }}>
                {property.description}
              </Text>
            </View>
          )}

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.foreground,
                textAlign: 'right',
                writingDirection: 'rtl',
                marginBottom: 8,
              }}>
                المميزات
              </Text>
              <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 }}>
                {property.amenities.map((amenity, idx) => (
                  <View
                    key={idx}
                    style={{
                      backgroundColor: isDark ? colors.card : colors.accent,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: colors.accentForeground, writingDirection: 'rtl' }}>
                      {amenity}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Agent Card */}
          {(property.agent_name || property.agent_phone) && (
            <View style={{
              backgroundColor: isDark ? colors.card : colors.input,
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.foreground,
                textAlign: 'right',
                writingDirection: 'rtl',
                marginBottom: 12,
              }}>
                معلومات التواصل
              </Text>
              {property.agent_name && (
                <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Text style={{ fontSize: 18 }}>👤</Text>
                  <Text style={{ fontSize: 15, color: colors.foreground, fontWeight: '600', writingDirection: 'rtl' }}>
                    {property.agent_name}
                  </Text>
                </View>
              )}
              {property.agent_phone && (
                <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Text style={{ fontSize: 18 }}>📱</Text>
                  <Text style={{ fontSize: 14, color: colors.mutedForeground }}>{property.agent_phone}</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row-reverse', gap: 10 }}>
                <TouchableOpacity
                  onPress={handleWhatsApp}
                  style={{
                    flex: 1,
                    backgroundColor: '#25D366',
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: 'center',
                    flexDirection: 'row-reverse',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>💬</Text>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>واتساب</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCall}
                  style={{
                    flex: 1,
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: 'center',
                    flexDirection: 'row-reverse',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>📞</Text>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>اتصال</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
