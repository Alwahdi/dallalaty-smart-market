import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function AuthScreen() {
  const { colors, isDark } = useTheme();
  const { signIn, signUp, isLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    if (!isLogin && !fullName.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال الاسم الكامل');
      return;
    }
    try {
      if (isLogin) {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password, fullName.trim(), phone.trim() || undefined);
      }
    } catch {
      // Error handled in context
    }
  };

  const inputStyle = {
    backgroundColor: isDark ? colors.card : colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.foreground,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
    marginBottom: 12,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 40,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <Text style={{ fontSize: 56, marginBottom: 12 }}>🏪</Text>
            <Text style={{
              fontSize: 28,
              fontWeight: '900',
              color: colors.primary,
              textAlign: 'center',
            }}>
              دلالتي
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.mutedForeground,
              textAlign: 'center',
              writingDirection: 'rtl',
              marginTop: 4,
            }}>
              السوق الذكي - ابحث واعثر على ما تريد
            </Text>
          </View>

          {/* Tab Switch */}
          <View style={{
            flexDirection: 'row-reverse',
            backgroundColor: isDark ? colors.card : colors.muted,
            borderRadius: 12,
            padding: 4,
            marginBottom: 24,
          }}>
            <TouchableOpacity
              onPress={() => setIsLogin(true)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: isLogin ? colors.primary : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text style={{
                fontSize: 14,
                fontWeight: '700',
                color: isLogin ? '#fff' : colors.mutedForeground,
              }}>
                تسجيل الدخول
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsLogin(false)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: !isLogin ? colors.primary : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text style={{
                fontSize: 14,
                fontWeight: '700',
                color: !isLogin ? '#fff' : colors.mutedForeground,
              }}>
                إنشاء حساب
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          {!isLogin && (
            <>
              <TextInput
                style={inputStyle}
                placeholder="الاسم الكامل"
                placeholderTextColor={colors.mutedForeground}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
              <TextInput
                style={inputStyle}
                placeholder="رقم الهاتف (اختياري)"
                placeholderTextColor={colors.mutedForeground}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </>
          )}

          <TextInput
            style={inputStyle}
            placeholder="البريد الإلكتروني"
            placeholderTextColor={colors.mutedForeground}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={inputStyle}
            placeholder="كلمة المرور"
            placeholderTextColor={colors.mutedForeground}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 8,
              opacity: isLoading ? 0.7 : 1,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>
                {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
