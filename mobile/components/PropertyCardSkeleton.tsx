import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Layout } from '@/constants/Layout';
import { useEffect, useRef } from 'react';

export default function PropertyCardSkeleton() {
  const { colors } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const SkeletonBlock = ({ style }: { style?: object }) => (
    <Animated.View
      style={[
        { backgroundColor: colors.skeleton, borderRadius: 6, opacity },
        style,
      ]}
    />
  );

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <SkeletonBlock style={styles.image} />
      <View style={styles.content}>
        <SkeletonBlock style={styles.titleLine} />
        <SkeletonBlock style={styles.priceLine} />
        <SkeletonBlock style={styles.locationLine} />
        <View style={styles.amenitiesRow}>
          <SkeletonBlock style={styles.amenityBox} />
          <SkeletonBlock style={styles.amenityBox} />
          <SkeletonBlock style={styles.amenityBox} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Layout.spacing.cardGap,
  },
  image: {
    height: 180,
    borderRadius: 0,
  },
  content: {
    padding: 12,
    gap: 8,
  },
  titleLine: {
    height: 18,
    width: '80%',
    alignSelf: 'flex-end',
  },
  priceLine: {
    height: 20,
    width: '50%',
    alignSelf: 'flex-end',
  },
  locationLine: {
    height: 14,
    width: '60%',
    alignSelf: 'flex-end',
  },
  amenitiesRow: {
    flexDirection: 'row-reverse',
    gap: 12,
    marginTop: 4,
  },
  amenityBox: {
    height: 14,
    width: 50,
  },
});
