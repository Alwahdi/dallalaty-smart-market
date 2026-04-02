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
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../hooks/useNotifications';
import { Notification as AppNotification } from '../types';

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  return date.toLocaleDateString('ar');
}

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotifications();

  const renderNotification = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity
      onPress={() => markAsRead(item.id)}
      style={{
        backgroundColor: item.read
          ? (isDark ? colors.card : '#fff')
          : (isDark ? colors.primary + '15' : colors.primary + '08'),
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: item.read ? colors.border : colors.primary + '30',
      }}
    >
      <View style={{
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
            {!item.read && (
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.primary,
              }} />
            )}
            <Text style={{
              fontSize: 15,
              fontWeight: item.read ? '500' : '700',
              color: colors.foreground,
              textAlign: 'right',
              writingDirection: 'rtl',
            }}>
              {item.title}
            </Text>
          </View>
          <Text style={{
            fontSize: 13,
            color: colors.mutedForeground,
            textAlign: 'right',
            writingDirection: 'rtl',
            marginTop: 4,
            lineHeight: 20,
          }}>
            {item.message}
          </Text>
          <Text style={{
            fontSize: 11,
            color: colors.mutedForeground,
            textAlign: 'right',
            writingDirection: 'rtl',
            marginTop: 6,
          }}>
            {timeAgo(item.created_at)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => deleteNotification(item.id)}
          style={{ padding: 4, marginRight: -4 }}
        >
          <Text style={{ fontSize: 16, color: colors.mutedForeground }}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Text style={{ fontSize: 20 }}>→</Text>
          </TouchableOpacity>
          <Text style={{
            fontSize: 20,
            fontWeight: '800',
            color: colors.foreground,
            writingDirection: 'rtl',
          }}>
            🔔 الإشعارات
          </Text>
          {unreadCount > 0 && (
            <View style={{
              backgroundColor: colors.destructive,
              borderRadius: 10,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>
              تحديد الكل كمقروء ✓
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        renderItem={renderNotification}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshNotifications}
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
              <Text style={{ fontSize: 64, marginBottom: 16 }}>🔕</Text>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.foreground,
                textAlign: 'center',
                writingDirection: 'rtl',
              }}>
                لا توجد إشعارات
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.mutedForeground,
                textAlign: 'center',
                writingDirection: 'rtl',
                marginTop: 8,
              }}>
                سنرسل لك إشعارات عند وجود جديد
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
