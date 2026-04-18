import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Layout } from '@/constants/Layout';

export default function AccountScreen() {
  const { colors, isDark, toggleTheme, mode, setMode } = useTheme();
  const { user, profile, signOut, updatePhone, refreshProfile } = useAuth();
  const router = useRouter();

  const [editingPhone, setEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSignOut = () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد من تسجيل الخروج؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'تسجيل الخروج',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace('/');
        },
      },
    ]);
  };

  const handleSavePhone = async () => {
    if (!newPhone.trim()) return;
    setSaving(true);
    const { error } = await updatePhone(newPhone.trim());
    if (error) {
      Alert.alert('خطأ', error);
    } else {
      setEditingPhone(false);
      await refreshProfile();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setSaving(false);
  };

  const MenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    danger,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.menuItem,
        {
          backgroundColor: pressed ? colors.surface : colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={styles.menuRight}>
        <View
          style={[
            styles.menuIcon,
            {
              backgroundColor: danger
                ? colors.error + '15'
                : colors.primaryMuted,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={danger ? colors.error : colors.primary}
          />
        </View>
        <View style={styles.menuTextContainer}>
          <Text
            style={[
              styles.menuTitle,
              { color: danger ? colors.error : colors.text },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.menuSubtitle, { color: colors.textMuted }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement || (
        onPress && <Ionicons name="chevron-back" size={18} color={colors.textMuted} />
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.title, { color: colors.text }]}>حسابي</Text>

        {/* Profile Card */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              ...(Layout.shadow.md as object),
            },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primaryMuted }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '؟'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {profile?.full_name || 'مستخدم'}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.textMuted }]}>
              {user?.email}
            </Text>
          </View>
        </View>

        {/* Phone Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          معلومات الاتصال
        </Text>

        {editingPhone ? (
          <View
            style={[
              styles.phoneEditCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <TextInput
              style={[
                styles.phoneInput,
                { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              value={newPhone}
              onChangeText={setNewPhone}
              placeholder="05XXXXXXXX"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              textAlign="right"
            />
            <View style={styles.phoneActions}>
              <Pressable
                onPress={handleSavePhone}
                disabled={saving}
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
              >
                {saving ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>حفظ</Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => setEditingPhone(false)}
                style={[styles.cancelButton, { borderColor: colors.border }]}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  إلغاء
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <MenuItem
            icon="call-outline"
            title="رقم الهاتف"
            subtitle={profile?.phone || 'لم يتم إضافة رقم'}
            onPress={() => {
              setNewPhone(profile?.phone || '');
              setEditingPhone(true);
            }}
          />
        )}

        {/* Settings */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          الإعدادات
        </Text>

        <MenuItem
          icon={isDark ? 'moon' : 'sunny-outline'}
          title="الوضع الداكن"
          rightElement={
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={isDark ? colors.primary : '#FFF'}
            />
          }
        />

        {/* Theme Selection */}
        <View
          style={[
            styles.themeSelector,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Text style={[styles.themeLabel, { color: colors.text }]}>مظهر التطبيق</Text>
          <View style={styles.themeOptions}>
            {[
              { key: 'light' as const, label: 'فاتح', icon: 'sunny-outline' as const },
              { key: 'dark' as const, label: 'داكن', icon: 'moon-outline' as const },
              { key: 'system' as const, label: 'تلقائي', icon: 'phone-portrait-outline' as const },
            ].map(option => (
              <Pressable
                key={option.key}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setMode(option.key);
                }}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor:
                      mode === option.key ? colors.primary : colors.surface,
                    borderColor:
                      mode === option.key ? colors.primary : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={16}
                  color={mode === option.key ? '#FFF' : colors.text}
                />
                <Text
                  style={{
                    color: mode === option.key ? '#FFF' : colors.text,
                    fontSize: Layout.fontSize.sm,
                    fontWeight: '600',
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* About */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          حول التطبيق
        </Text>

        <MenuItem
          icon="information-circle-outline"
          title="عن دلالتي"
          subtitle="الإصدار 1.0.0"
        />
        <MenuItem
          icon="shield-checkmark-outline"
          title="سياسة الخصوصية"
          onPress={() => {}}
        />
        <MenuItem
          icon="document-text-outline"
          title="شروط الاستخدام"
          onPress={() => {}}
        />

        {/* Sign Out */}
        <View style={{ marginTop: 16 }}>
          <MenuItem
            icon="log-out-outline"
            title="تسجيل الخروج"
            onPress={handleSignOut}
            danger
          />
        </View>

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          دلالتي - السوق الذكي © 2025
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Layout.spacing.screenPadding,
    paddingBottom: 40,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: '800',
    writingDirection: 'rtl',
    textAlign: 'right',
    paddingTop: 8,
    marginBottom: 16,
  },
  profileCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
    alignItems: 'flex-end',
  },
  profileName: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
  profileEmail: {
    fontSize: Layout.fontSize.sm,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '700',
    writingDirection: 'rtl',
    textAlign: 'right',
    marginBottom: 8,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    marginBottom: 6,
  },
  menuRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
    gap: 2,
    alignItems: 'flex-end',
  },
  menuTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  menuSubtitle: {
    fontSize: Layout.fontSize.sm,
    writingDirection: 'rtl',
  },
  phoneEditCard: {
    padding: 14,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    marginBottom: 6,
    gap: 12,
  },
  phoneInput: {
    height: 46,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: Layout.fontSize.md,
    writingDirection: 'rtl',
  },
  phoneActions: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  saveButton: {
    flex: 1,
    height: 42,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: Layout.fontSize.md,
  },
  cancelButton: {
    flex: 1,
    height: 42,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontWeight: '600',
    fontSize: Layout.fontSize.md,
  },
  themeSelector: {
    padding: 14,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    marginBottom: 6,
    gap: 10,
  },
  themeLabel: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  themeOptions: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
  },
  footer: {
    textAlign: 'center',
    fontSize: Layout.fontSize.sm,
    marginTop: 32,
  },
});
