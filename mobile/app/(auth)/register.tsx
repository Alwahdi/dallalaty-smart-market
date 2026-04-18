import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Layout } from '@/constants/Layout';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { signUp } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleRegister = async () => {
    if (!fullName.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      setError('يرجى ملء جميع الحقول');
      shake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      shake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    setError('');

    const { error: authError } = await signUp(
      email.trim(),
      password,
      fullName.trim(),
      phone.trim()
    );

    if (authError) {
      setError(
        authError.includes('already registered')
          ? 'هذا البريد الإلكتروني مسجل مسبقاً'
          : authError
      );
      shake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setLoading(false);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (t: string) => void,
    icon: keyof typeof Ionicons.glyphMap,
    options: {
      placeholder: string;
      keyboardType?: 'default' | 'email-address' | 'phone-pad';
      autoCapitalize?: 'none' | 'sentences' | 'words';
      secureTextEntry?: boolean;
      ref?: React.RefObject<TextInput | null>;
      nextRef?: React.RefObject<TextInput | null>;
      returnKeyType?: 'next' | 'done';
    }
  ) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {options.secureTextEntry !== undefined && (
          <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        )}
        <TextInput
          ref={options.ref}
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={options.placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={options.keyboardType || 'default'}
          autoCapitalize={options.autoCapitalize || 'sentences'}
          autoCorrect={false}
          secureTextEntry={options.secureTextEntry && !showPassword}
          textAlign="right"
          returnKeyType={options.returnKeyType || 'next'}
          onSubmitEditing={() => options.nextRef?.current?.focus()}
        />
        <Ionicons name={icon} size={20} color={colors.textMuted} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={12}
          >
            <Ionicons name="arrow-forward" size={24} color={colors.text} />
          </Pressable>

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: colors.primaryMuted }]}>
              <Ionicons name="person-add" size={30} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>إنشاء حساب جديد</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              انضم إلى مجتمع دلالتي اليوم
            </Text>
          </View>

          {/* Error */}
          {error ? (
            <Animated.View
              style={[
                styles.errorContainer,
                {
                  backgroundColor: colors.error + '15',
                  borderColor: colors.error + '30',
                  transform: [{ translateX: shakeAnim }],
                },
              ]}
            >
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </Animated.View>
          ) : null}

          {renderInput('الاسم الكامل', fullName, setFullName, 'person-outline', {
            placeholder: 'أدخل اسمك الكامل',
            autoCapitalize: 'words',
            nextRef: phoneRef,
          })}

          {renderInput('رقم الهاتف', phone, setPhone, 'call-outline', {
            placeholder: '05XXXXXXXX',
            keyboardType: 'phone-pad',
            ref: phoneRef,
            nextRef: emailRef,
          })}

          {renderInput('البريد الإلكتروني', email, setEmail, 'mail-outline', {
            placeholder: 'email@example.com',
            keyboardType: 'email-address',
            autoCapitalize: 'none',
            ref: emailRef,
            nextRef: passwordRef,
          })}

          {renderInput('كلمة المرور', password, setPassword, 'lock-closed-outline', {
            placeholder: '6 أحرف على الأقل',
            secureTextEntry: true,
            ref: passwordRef,
            returnKeyType: 'done',
          })}

          {/* Register Button */}
          <Pressable
            onPress={handleRegister}
            disabled={loading}
            style={({ pressed }) => [
              styles.registerButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed || loading ? 0.8 : 1,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.registerButtonText}>إنشاء الحساب</Text>
            )}
          </Pressable>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Pressable onPress={() => router.push('/(auth)/login')}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>
                تسجيل الدخول
              </Text>
            </Pressable>
            <Text style={[styles.loginText, { color: colors.textMuted }]}>
              لديك حساب بالفعل؟
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: Layout.spacing.screenPadding,
    paddingTop: 8,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-end',
    padding: 4,
    marginBottom: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: '800',
    writingDirection: 'rtl',
  },
  subtitle: {
    fontSize: Layout.fontSize.md,
    writingDirection: 'rtl',
  },
  errorContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontSize: Layout.fontSize.sm,
    flex: 1,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  inputGroup: {
    marginBottom: 14,
    gap: 6,
  },
  label: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: Layout.fontSize.md,
    height: '100%',
    writingDirection: 'rtl',
  },
  registerButton: {
    height: 54,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: Layout.fontSize.lg,
    fontWeight: '800',
  },
  loginRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 20,
  },
  loginText: {
    fontSize: Layout.fontSize.md,
  },
  loginLink: {
    fontSize: Layout.fontSize.md,
    fontWeight: '700',
  },
});
