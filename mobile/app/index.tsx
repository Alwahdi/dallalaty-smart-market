import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/constants/Layout';

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const { colors, isDark } = useTheme();
  const { user, loading } = useAuth();
  const router = useRouter();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const featureAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)');
      return;
    }

    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered feature animations
    featureAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: 600 + index * 150,
        useNativeDriver: true,
      }).start();
    });
  }, [loading, user]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="storefront" size={48} color={colors.primary} />
      </View>
    );
  }

  const features = [
    { icon: 'search-outline' as const, title: 'بحث ذكي', desc: 'اعثر على ما تبحث عنه بسهولة' },
    { icon: 'shield-checkmark-outline' as const, title: 'آمن وموثوق', desc: 'إعلانات موثقة ومحمية' },
    { icon: 'flash-outline' as const, title: 'سريع ومحدث', desc: 'إعلانات جديدة كل لحظة' },
    { icon: 'heart-outline' as const, title: 'مفضلاتك', desc: 'احفظ ما يعجبك وتابعه' },
  ];

  return (
    <LinearGradient
      colors={isDark
        ? ['#151210', '#1E1A16', '#252018']
        : ['#FDFAF3', '#FAF5E8', '#F5EDD5']
      }
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Hero Section */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Logo */}
          <View style={[styles.logoContainer, { backgroundColor: colors.primaryMuted }]}>
            <Ionicons name="storefront" size={40} color={colors.primary} />
          </View>

          <Text style={[styles.appName, { color: colors.primary }]}>دلالتي</Text>
          <Text style={[styles.tagline, { color: colors.text }]}>السوق الذكي</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            منصة شاملة للعروض العقارية والتجارية{'\n'}
            في المملكة العربية السعودية
          </Text>
        </Animated.View>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <Animated.View
              key={feature.title}
              style={[
                styles.featureCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  ...(Layout.shadow.sm as object),
                  opacity: featureAnims[index],
                  transform: [
                    {
                      translateY: featureAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={[styles.featureIcon, { backgroundColor: colors.primaryMuted }]}>
                <Ionicons name={feature.icon} size={22} color={colors.primary} />
              </View>
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                {feature.title}
              </Text>
              <Text style={[styles.featureDesc, { color: colors.textMuted }]}>
                {feature.desc}
              </Text>
            </Animated.View>
          ))}
        </View>

        {/* CTA Buttons */}
        <Animated.View
          style={[
            styles.ctaSection,
            { opacity: fadeAnim },
          ]}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/(auth)/login');
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Text style={styles.primaryButtonText}>ابدأ الآن</Text>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(auth)/register');
            }}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                borderColor: colors.primary,
                backgroundColor: pressed ? colors.primaryMuted : 'transparent',
              },
            ]}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
              إنشاء حساب جديد
            </Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.screenPadding,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: height * 0.06,
    gap: 6,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 4,
    writingDirection: 'rtl',
  },
  featuresGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginVertical: 12,
  },
  featureCard: {
    width: (width - 58) / 2,
    padding: 16,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
  featureDesc: {
    fontSize: Layout.fontSize.xs,
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 18,
  },
  ctaSection: {
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: Layout.borderRadius.lg,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: Layout.fontSize.lg,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '700',
  },
});
