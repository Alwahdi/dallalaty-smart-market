import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useRoles } from '../hooks/useRoles';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AccountScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, profile, signOut, updateProfile, isLoading } = useAuth();
  const { isAdmin } = useRoles();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        phone,
        location,
        bio,
      });
      setEditing(false);
      Alert.alert('✅', 'تم حفظ التغييرات بنجاح');
    } catch {
      // Error handled in context
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'خروج', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const inputStyle = {
    backgroundColor: isDark ? colors.card : colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.foreground,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
    marginBottom: 12,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={{
          alignItems: 'center',
          paddingVertical: 24,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.primary + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
          }}>
            <Text style={{ fontSize: 36 }}>👤</Text>
          </View>
          <Text style={{
            fontSize: 20,
            fontWeight: '800',
            color: colors.foreground,
            writingDirection: 'rtl',
          }}>
            {profile?.full_name || 'مستخدم'}
          </Text>
          <Text style={{
            fontSize: 13,
            color: colors.mutedForeground,
            marginTop: 2,
          }}>
            {user?.email}
          </Text>
          {isAdmin && (
            <View style={{
              backgroundColor: colors.primary + '20',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
              marginTop: 8,
            }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>👑 مسؤول</Text>
            </View>
          )}
        </View>

        <View style={{ padding: 16 }}>
          {/* Edit Profile */}
          <View style={{
            backgroundColor: isDark ? colors.card : '#fff',
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <View style={{
              flexDirection: 'row-reverse',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.foreground,
                writingDirection: 'rtl',
              }}>
                الملف الشخصي
              </Text>
              <TouchableOpacity onPress={() => setEditing(!editing)}>
                <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '600' }}>
                  {editing ? 'إلغاء' : 'تعديل ✏️'}
                </Text>
              </TouchableOpacity>
            </View>

            {editing ? (
              <>
                <Text style={{ fontSize: 12, color: colors.mutedForeground, textAlign: 'right', writingDirection: 'rtl', marginBottom: 4 }}>الاسم الكامل</Text>
                <TextInput style={inputStyle} value={fullName} onChangeText={setFullName} placeholder="الاسم الكامل" placeholderTextColor={colors.mutedForeground} />

                <Text style={{ fontSize: 12, color: colors.mutedForeground, textAlign: 'right', writingDirection: 'rtl', marginBottom: 4 }}>رقم الهاتف</Text>
                <TextInput style={inputStyle} value={phone} onChangeText={setPhone} placeholder="رقم الهاتف" placeholderTextColor={colors.mutedForeground} keyboardType="phone-pad" />

                <Text style={{ fontSize: 12, color: colors.mutedForeground, textAlign: 'right', writingDirection: 'rtl', marginBottom: 4 }}>الموقع</Text>
                <TextInput style={inputStyle} value={location} onChangeText={setLocation} placeholder="المدينة" placeholderTextColor={colors.mutedForeground} />

                <Text style={{ fontSize: 12, color: colors.mutedForeground, textAlign: 'right', writingDirection: 'rtl', marginBottom: 4 }}>نبذة</Text>
                <TextInput style={[inputStyle, { height: 80, textAlignVertical: 'top' }]} value={bio} onChangeText={setBio} placeholder="أخبرنا عن نفسك..." placeholderTextColor={colors.mutedForeground} multiline />

                <TouchableOpacity
                  onPress={handleSave}
                  disabled={saving}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: 'center',
                    marginTop: 4,
                  }}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>حفظ التغييرات</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <InfoRow label="الاسم" value={profile?.full_name} colors={colors} />
                <InfoRow label="الهاتف" value={profile?.phone} colors={colors} />
                <InfoRow label="البريد" value={user?.email} colors={colors} />
                <InfoRow label="الموقع" value={profile?.location} colors={colors} />
                {profile?.bio && <InfoRow label="النبذة" value={profile.bio} colors={colors} />}
              </>
            )}
          </View>

          {/* Settings */}
          <View style={{
            backgroundColor: isDark ? colors.card : '#fff',
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
              writingDirection: 'rtl',
              textAlign: 'right',
              marginBottom: 16,
            }}>
              الإعدادات
            </Text>
            <View style={{
              flexDirection: 'row-reverse',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}>
              <Text style={{ fontSize: 14, color: colors.foreground, writingDirection: 'rtl' }}>
                {isDark ? '🌙 الوضع الداكن' : '☀️ الوضع الفاتح'}
              </Text>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.muted, true: colors.primary + '40' }}
                thumbColor={isDark ? colors.primary : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Admin */}
          {isAdmin && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Admin')}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                flexDirection: 'row-reverse',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 20 }}>⚙️</Text>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>لوحة التحكم</Text>
            </TouchableOpacity>
          )}

          {/* Sign Out */}
          <TouchableOpacity
            onPress={handleSignOut}
            style={{
              backgroundColor: colors.destructive + '15',
              borderRadius: 16,
              padding: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.destructive + '30',
            }}
          >
            <Text style={{ color: colors.destructive, fontWeight: '700', fontSize: 15 }}>
              🚪 تسجيل الخروج
            </Text>
          </TouchableOpacity>

          {/* Version */}
          <Text style={{
            fontSize: 12,
            color: colors.mutedForeground,
            textAlign: 'center',
            marginTop: 24,
          }}>
            دلالتي v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, colors }: { label: string; value?: string | null; colors: any }) {
  return (
    <View style={{
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '50',
    }}>
      <Text style={{ fontSize: 13, color: colors.mutedForeground, writingDirection: 'rtl' }}>{label}</Text>
      <Text style={{ fontSize: 13, color: colors.foreground, fontWeight: '500' }}>{value || '-'}</Text>
    </View>
  );
}
