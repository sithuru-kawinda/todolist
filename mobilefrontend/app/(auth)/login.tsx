import { useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const { registered } = useLocalSearchParams<{ registered?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } }; code?: string };
      if (e.code === 'ERR_NETWORK' || e.code === 'ECONNABORTED') {
        setError('Cannot reach the server. Check your API URL in .env and make sure the backend is running.');
      } else {
        setError(e.response?.data?.error?.message ?? 'Invalid credentials. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ImageBackground
      source={require('../../assets/images/mobilebackground.jpg')}
      style={styles.root}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarCheck}>✓</Text>
        </View>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.title}>LOGIN</Text>

        {registered === '1' && (
          <Text style={styles.successText}>Account created! Please log in.</Text>
        )}

        <View style={[styles.inputRow, error && email === '' ? styles.inputError : undefined]}>
          <Text style={styles.icon}>✉</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.icon}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={Colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable
          style={[styles.btn, submitting && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={submitting}
        >
          {submitting
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={styles.btnText}>LOGIN</Text>}
        </Pressable>

        <Link href="/(auth)/register" asChild>
          <Pressable style={styles.linkWrap}>
            <Text style={styles.linkText}>
              No account? <Text style={styles.linkAccent}>Register here</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 36, 64, 0.72)',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  avatarWrap: {
    marginBottom: -32,
    zIndex: 10,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.bgDeep,
    ...Platform.select({
      ios: { shadowColor: Colors.accent, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 8 },
      web: { boxShadow: '0 4px 16px rgba(220,38,38,0.5)' } as object,
    }),
  },
  avatarCheck: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: 'bold',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.inputBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 28,
    paddingTop: 52,
    paddingBottom: 28,
    gap: 14,
  },
  title: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 50,
  },
  inputError: {
    borderColor: Colors.accent,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
  },
  successText: {
    color: Colors.success,
    fontSize: 13,
    textAlign: 'center',
  },
  errorText: {
    color: Colors.accent,
    fontSize: 13,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: Colors.accent,
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 3,
  },
  linkWrap: {
    alignItems: 'center',
    paddingTop: 4,
  },
  linkText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  linkAccent: {
    color: Colors.accent,
    fontWeight: '600',
  },
});
