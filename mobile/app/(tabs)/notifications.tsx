import React from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import EmptyState from '@/components/EmptyState';
import { Layout } from '@/constants/Layout';

function NotificationItem({
  notification,
  onPress,
  onDelete,
}: {
  notification: Notification;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { colors } = useTheme();

  const getIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'success':
        return 'checkmark-circle-outline';
      case 'warning':
        return 'warning-outline';
      case 'error':
        return 'alert-circle-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.info;
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.notifItem,
        {
          backgroundColor: notification.read
            ? colors.card
            : colors.primaryMuted,
          borderColor: colors.cardBorder,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={styles.notifRow}>
        <View
          style={[
            styles.notifIcon,
            { backgroundColor: getColor(notification.type) + '20' },
          ]}
        >
          <Ionicons
            name={getIcon(notification.type)}
            size={22}
            color={getColor(notification.type)}
          />
        </View>
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, { color: colors.text }]}>
            {notification.title}
          </Text>
          {notification.message && (
            <Text
              style={[styles.notifMessage, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {notification.message}
            </Text>
          )}
          <Text style={[styles.notifTime, { color: colors.textMuted }]}>
            {timeAgo(notification.created_at)}
          </Text>
        </View>
        <Pressable onPress={onDelete} hitSlop={12} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
        </Pressable>
      </View>
      {!notification.read && (
        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
      )}
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  } = useNotifications();

  const handlePress = (notif: Notification) => {
    if (!notif.read) {
      markAsRead(notif.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deleteNotification(id);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>الإشعارات</Text>
        {unreadCount > 0 && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              markAllAsRead();
            }}
            style={[styles.markAllButton, { borderColor: colors.primary }]}
          >
            <Text style={[styles.markAllText, { color: colors.primary }]}>
              قراءة الكل
            </Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => handlePress(item)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-outline"
            title="لا توجد إشعارات"
            subtitle="ستظهر هنا الإشعارات الجديدة عند وصولها"
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.screenPadding,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: '800',
    writingDirection: 'rtl',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
  },
  markAllText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: Layout.spacing.screenPadding,
    paddingBottom: 20,
    flexGrow: 1,
  },
  notifItem: {
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    padding: 14,
    position: 'relative',
  },
  notifRow: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: {
    flex: 1,
    gap: 4,
    alignItems: 'flex-end',
  },
  notifTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '700',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  notifMessage: {
    fontSize: Layout.fontSize.sm,
    lineHeight: 20,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  notifTime: {
    fontSize: Layout.fontSize.xs,
    marginTop: 2,
    writingDirection: 'rtl',
  },
  deleteButton: {
    padding: 4,
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
