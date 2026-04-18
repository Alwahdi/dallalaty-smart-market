import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useRoles } from '../hooks/useRoles';
import { supabase } from '../lib/supabase';

interface Stats {
  users: number;
  properties: number;
  categories: number;
  notifications: number;
}

export default function AdminScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { profile } = useAuth();
  const { isAdmin, isPropertiesAdmin, isCategoriesAdmin, isNotificationsAdmin } = useRoles();
  const [stats, setStats] = useState<Stats>({ users: 0, properties: 0, categories: 0, notifications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [usersRes, propertiesRes, categoriesRes, notificationsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('notifications').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        users: usersRes.count || 0,
        properties: propertiesRes.count || 0,
        categories: categoriesRes.count || 0,
        notifications: notificationsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin && !isPropertiesAdmin && !isCategoriesAdmin && !isNotificationsAdmin) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🔒</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, writingDirection: 'rtl' }}>
          غير مصرح بالوصول
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            marginTop: 20,
            backgroundColor: colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>رجوع</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const statCards = [
    { title: 'المستخدمين', value: stats.users, icon: '👥', color: '#3b82f6' },
    { title: 'العقارات', value: stats.properties, icon: '🏠', color: '#22c55e' },
    { title: 'الأقسام', value: stats.categories, icon: '📂', color: '#f59e0b' },
    { title: 'الإشعارات', value: stats.notifications, icon: '🔔', color: '#ef4444' },
  ];

  const adminSections = [
    { title: 'إدارة المستخدمين', icon: '👥', desc: 'عرض وإدارة حسابات المستخدمين', visible: isAdmin },
    { title: 'إدارة العقارات', icon: '🏠', desc: 'إضافة وتعديل وحذف العقارات', visible: isPropertiesAdmin },
    { title: 'إدارة الأقسام', icon: '📂', desc: 'تنظيم الأقسام والفئات', visible: isCategoriesAdmin },
    { title: 'إرسال الإشعارات', icon: '📢', desc: 'إرسال إشعارات للمستخدمين', visible: isNotificationsAdmin },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row-reverse',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 8,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Text style={{ fontSize: 20 }}>→</Text>
          </TouchableOpacity>
          <Text style={{
            fontSize: 22,
            fontWeight: '800',
            color: colors.foreground,
            writingDirection: 'rtl',
          }}>
            ⚙️ لوحة التحكم
          </Text>
        </View>

        {/* Welcome */}
        <View style={{
          margin: 16,
          backgroundColor: colors.primary,
          borderRadius: 16,
          padding: 20,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '800',
            color: '#fff',
            textAlign: 'right',
            writingDirection: 'rtl',
          }}>
            أهلاً {profile?.full_name || 'مسؤول'} 👋
          </Text>
          <Text style={{
            fontSize: 13,
            color: '#ffffff90',
            textAlign: 'right',
            writingDirection: 'rtl',
            marginTop: 4,
          }}>
            إدارة التطبيق والمحتوى
          </Text>
        </View>

        {/* Stats Grid */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : (
          <View style={{
            flexDirection: 'row-reverse',
            flexWrap: 'wrap',
            paddingHorizontal: 12,
            gap: 10,
            marginBottom: 20,
          }}>
            {statCards.map((card) => (
              <View
                key={card.title}
                style={{
                  width: '47%',
                  backgroundColor: isDark ? colors.card : '#fff',
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</Text>
                <Text style={{
                  fontSize: 28,
                  fontWeight: '900',
                  color: card.color,
                }}>
                  {card.value}
                </Text>
                <Text style={{
                  fontSize: 13,
                  color: colors.mutedForeground,
                  writingDirection: 'rtl',
                  textAlign: 'right',
                  marginTop: 2,
                }}>
                  {card.title}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Admin Sections */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.foreground,
            textAlign: 'right',
            writingDirection: 'rtl',
            marginBottom: 12,
          }}>
            الإدارة
          </Text>
          {adminSections
            .filter((s) => s.visible)
            .map((section) => (
              <TouchableOpacity
                key={section.title}
                style={{
                  backgroundColor: isDark ? colors.card : '#fff',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 10,
                  flexDirection: 'row-reverse',
                  alignItems: 'center',
                  gap: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 32 }}>{section.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: colors.foreground,
                    textAlign: 'right',
                    writingDirection: 'rtl',
                  }}>
                    {section.title}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: colors.mutedForeground,
                    textAlign: 'right',
                    writingDirection: 'rtl',
                    marginTop: 2,
                  }}>
                    {section.desc}
                  </Text>
                </View>
                <Text style={{ fontSize: 16, color: colors.mutedForeground }}>←</Text>
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
